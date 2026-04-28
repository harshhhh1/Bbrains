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

        // 2. Find recipient wallet by email (wallet ID) or userId
        const recipientWallet = await tx.wallet.findFirst({
            where: {
                OR: [
                    { id: recipientEmail },
                    { userId: recipientEmail }
                ]
            }
        });

        if (!recipientWallet) throw new Error("Recipient wallet not found");
        if (recipientWallet.userId === senderId) throw new Error("Cannot send to self");

        // 3. Perform Transfer
        await tx.wallet.update({
            where: { id: senderWallet.id },
            data: { balance: { decrement: Number(amount) } }
        });

        await tx.wallet.update({
            where: { id: recipientWallet.id },
            data: { balance: { increment: Number(amount) } }
        });

        // 4. Log Transactions (Debit for Sender, Credit for Recipient)
        const entryGroupId = crypto.randomUUID();

        const debitTx = await tx.transactionHistory.create({
            data: {
                userId: senderId,
                recordedById: senderId,
                relatedUserId: recipientWallet.userId,
                entryGroupId,
                amount: Number(amount),
                type: 'debit',
                category: 'transfer',
                status: 'success',
                paymentMode: 'wallet',
                primaryRecord: true,
                note: `Sent to ${recipientWallet.id}: ${note || ''}`
            }
        });

        const creditTx = await tx.transactionHistory.create({
            data: {
                userId: recipientWallet.userId,
                recordedById: senderId,
                relatedUserId: senderId,
                entryGroupId,
                amount: Number(amount),
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

const getSentRequests = async (userId) => {
    return await prisma.moneyRequest.findMany({
        where: { fromUserId: userId },
        include: {
            toUser: {
                select: {
                    username: true,
                    userDetails: { select: { firstName: true, lastName: true, avatar: true } }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};

const getIncomingRequestsList = async (userId) => {
    return await prisma.moneyRequest.findMany({
        where: { toUserId: userId },
        include: {
            fromUser: {
                select: {
                    username: true,
                    userDetails: { select: { firstName: true, lastName: true, avatar: true } }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
};

const createMoneyRequest = async (fromUserId, toUserId, amount, reason) => {
    const fromUser = await prisma.user.findUnique({ where: { id: fromUserId }, select: { username: true } });
    
    const request = await prisma.moneyRequest.create({
        data: {
            fromUserId,
            toUserId,
            amount,
            reason,
            status: 'pending'
        }
    });

    await createNotification({
        userId: toUserId,
        actorId: fromUserId,
        title: 'Money Requested 💸',
        message: `@${fromUser.username} requested ₹${amount} for: ${reason}`,
        type: 'finance',
        relatedId: request.id
    });

    return request;
};

const respondToMoneyRequest = async (userId, requestId, accept, pin) => {
    const request = await prisma.moneyRequest.findUnique({
        where: { id: requestId },
        include: { fromUser: { select: { id: true, username: true } } }
    });

    if (!request) throw new Error("Request not found");
    if (request.toUserId !== userId) throw new Error("Unauthorized");
    if (request.status !== 'pending') throw new Error("Request already processed");

    if (!accept) {
        await prisma.moneyRequest.update({
            where: { id: requestId },
            data: { status: 'rejected' }
        });

        await createNotification({
            userId: request.fromUserId,
            actorId: userId,
            title: 'Request Rejected ❌',
            message: `Your request for ₹${request.amount} was rejected.`,
            type: 'finance',
            relatedId: request.id
        });

        return { status: 'rejected' };
    }

    // Process payment
    const transfer = await transferFunds(userId, request.fromUserId, Number(request.amount), `Payment for request: ${request.reason}`, pin);

    await prisma.moneyRequest.update({
        where: { id: requestId },
        data: { status: 'accepted' }
    });

    await createNotification({
        userId: request.fromUserId,
        actorId: userId,
        title: 'Request Accepted! ✅',
        message: `Your request for ₹${request.amount} was accepted and funds transferred.`,
        type: 'finance',
        relatedId: request.id
    });

    return { status: 'accepted', transfer };
};

export { 
    transferFunds, 
    getTransactionHistory, 
    getWalletDetails, 
    createMoneyRequest, 
    getSentRequests, 
    getIncomingRequestsList, 
    respondToMoneyRequest 
};
