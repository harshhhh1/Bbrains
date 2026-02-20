import prisma from "../utils/prisma.js";

const getAllProducts = async (skip = 0, take = 10) => {
    const [products, total] = await prisma.$transaction([
        prisma.product.findMany({
            skip: parseInt(skip),
            take: parseInt(take),
            orderBy: { createdAt: 'desc' }
        }),
        prisma.product.count()
    ]);
    return { products, total };
}


const createProduct = async (name, description, price, stock, image, creatorId) => {
    const product = await prisma.product.create({
        data: {
            name,
            description,
            price,
            stock,
            image,
            creatorId
        }
    })
    return product;
}

const updateProduct = async (id, data) => {
    return await prisma.product.update({
        where: { id: parseInt(id) },
        data: data
    });
};

const deleteProduct = async (id) => {
    return await prisma.product.delete({
        where: { id: parseInt(id) }
    });
};

const findProductByName = async (name) => {
    return await prisma.product.findMany({
        where: {
            name: {
                contains: name,
                mode: 'insensitive'
            }
        }
    });
};

const addToCart = async (userId, productId, quantity = 1) => {
    // Check if product exists and has stock
    const product = await prisma.product.findUnique({
        where: { id: parseInt(productId) }
    });

    if (!product) throw new Error("Product not found");
    if (product.stock < quantity) throw new Error("Insufficient stock");

    // Check if already in cart
    const existingItem = await prisma.cart.findFirst({
        where: {
            userId: userId,
            productId: parseInt(productId)
        }
    });

    if (existingItem) {
        return await prisma.cart.update({
            where: { id: existingItem.id },
            data: {
                quantity: existingItem.quantity + quantity
            }
        });
    }

    return await prisma.cart.create({
        data: {
            userId,
            productId: parseInt(productId),
            quantity,
            price: parseInt(product.price) // store snapshot of price
        }
    });
};

const getCart = async (userId) => {
    return await prisma.cart.findMany({
        where: { userId },
        include: {
            product: {
                select: {
                    name: true,
                    description: true,
                    image: true,
                    price: true
                }
            }
        }
    });
};

const removeFromCart = async (userId, cartItemId) => {
    const item = await prisma.cart.findUnique({
        where: { id: parseInt(cartItemId) }
    });

    if (!item || item.userId !== userId) {
        throw new Error("Cart item not found or unauthorized");
    }

    return await prisma.cart.delete({
        where: { id: parseInt(cartItemId) }
    });
};

const checkout = async (userId, pin) => {
    return await prisma.$transaction(async (tx) => {
        // 1. Validate User Queue & Wallet PIN
        const wallet = await tx.wallet.findUnique({
            where: { userId }
        });

        if (!wallet) throw new Error("Wallet not configured");
        if (wallet.pin !== pin) throw new Error("Invalid Wallet PIN");

        // 2. Get Cart Items
        const cartItems = await tx.cart.findMany({
            where: { userId },
            include: { product: true }
        });

        if (cartItems.length === 0) throw new Error("Cart is empty");

        // 3. Calculate Total & Validate Stock
        let totalAmount = 0;
        for (const item of cartItems) {
            if (item.product.stock < item.quantity) {
                throw new Error(`Insufficient stock for ${item.product.name}`);
            }
            totalAmount += Number(item.product.price) * item.quantity;
        }

        // 4. Check Balance
        if (Number(wallet.balance) < totalAmount) {
            throw new Error("Insufficient wallet balance");
        }

        // 5. Deduct Balance
        await tx.wallet.update({
            where: { userId },
            data: { balance: { decrement: totalAmount } }
        });

        // 6. Create Order
        const order = await tx.order.create({
            data: {
                userId,
                totalAmount,
                status: 'completed',
                items: {
                    create: cartItems.map(item => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.product.price
                    }))
                }
            }
        });

        // 7. Update Stock & Clear Cart
        for (const item of cartItems) {
            await tx.product.update({
                where: { id: item.productId },
                data: { stock: { decrement: item.quantity } }
            });
        }

        await tx.cart.deleteMany({
            where: { userId }
        });

        // 8. Log Transaction
        await tx.transactionHistory.create({
            data: {
                userId,
                amount: totalAmount,
                type: 'debit',
                status: 'success',
                note: `Order #${order.id} Payment`
            }
        });

        await tx.auditLog.create({
            data: {
                userId,
                category: "MARKET",
                action: "CHECKOUT",
                entity: "Order",
                entityId: String(order.id)
            }
        });

        return order;
    });
};

export { getAllProducts, createProduct, updateProduct, deleteProduct, findProductByName, addToCart, getCart, removeFromCart, checkout }