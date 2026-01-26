import prisma from "../utils/prisma.js";

const getAllProducts = async () => {
    const products = await prisma.product.findMany();
    console.log(products)
    return products;
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

export { getAllProducts, createProduct, updateProduct, deleteProduct }