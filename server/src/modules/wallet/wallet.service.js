import prisma from "../../utils/prisma.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { createNotification } from "../notification/notification.service.js";

const transferFunds = async (senderId, recipientEmail, amount, note, pin) => {
    return await prisma.$transaction(async (tx) => {
        // ... [OMITTED PART 1 - SENDER VERIF]
        const senderWallet = await tx.wallet.findUnique({
            where: { userId: senderId },
            include: { user: { select: { username: true } } }
        });

        if (!senderWallet) throw new Error("Sender wallet not found");
        
        // ... [OMITTED PART 2 - PIN/BALANCE]
        let pinMatch = false;
        if (senderWallet.pin && senderWallet.pin.length > 6) {
            pinMatch = await bcrypt.compare(pin, senderWallet.pin);
        } else {
            pinMatch = senderWallet.pin === pin;
        }
        
        if (!pinMatch) throw new Error("Invalid PIN");

        if (Number(senderWallet.balance) < Number(amount)) {
            throw new Error("Insufficient balance");
        }

        // 2. Find recipient wallet by email (wallet ID)
        const recipientWallet = await tx.wallet.findUnique({
            where: { id: recipientEmail }
        });

        if (!recipientWallet) throw new Error("Recipient wallet not found");
        if (recipientWallet.userId === senderId) throw new Error("Cannot send to self");

        // 3. Perform Transfer
        await tx.wallet.update({
            where: { id: senderWallet.id },
            data: { balance: { decrement: amount } }
        });

        await tx.wallet.update({
            where: { id: recipientWallet.id },
            data: { balance: { increment: amount } }
        });

        // 4. Log Transactions (Debit for Sender, Credit for Recipient)
        const entryGroupId = crypto.randomUUID();

        const debitTx = await tx.transactionHistory.create({
            data: {
                userId: senderId,
                recordedById: senderId,
                relatedUserId: recipientWallet.userId,
                entryGroupId,
                amount: amount,
                type: 'debit',
                category: 'transfer',
                status: 'success',
                paymentMode: 'wallet',
                primaryRecord: true,
                note: `Sent to ${recipientEmail}: ${note || ''}`
            }
        });

        const creditTx = await tx.transactionHistory.create({
            data: {
                userId: recipientWallet.userId,
                recordedById: senderId,
                relatedUserId: senderId,
                entryGroupId,
                amount: amount,
                type: 'credit',
                category: 'transfer',
                status: 'success',
                paymentMode: 'wallet',
                primaryRecord: false,
                note: `Received from ${senderWallet.id}: ${note || ''}`
            }
        });

        // 5. Send Notification to Recipient
        await createNotification({
            userId: recipientWallet.userId,
            actorId: senderId,
            title: 'Money Received! 💰',
            message: `You received ₹${amount} from @${senderWallet.user.username}.${note ? ` Note: ${note}` : ""}`,
            type: 'finance',
            relatedId: String(creditTx.id)
        });

        return { debitTx, creditTx };
    });
};

const getTransactionHistory = async (userId) => {
    return await prisma.transactionHistory.findMany({
        where: { userId },
        orderBy: { transactionDate: 'desc' }
    });
};

const getWalletDetails = async (userId) => {
    return await prisma.wallet.findUnique({
        where: { userId },
        include: {
            user: {
                select: { username: true, email: true }
            }
        }
    });
};

export { transferFunds, getTransactionHistory, getWalletDetails };
