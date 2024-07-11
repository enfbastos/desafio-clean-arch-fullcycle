import { Sequelize } from "sequelize-typescript";
import ProductFactory from "../../domain/product/factory/product.factory";
import ProductModel from "../../infrastructure/product/repository/sequelize/product.model";
import ProductRepository from "../../infrastructure/product/repository/sequelize/product.repository";
import FindProductUseCase from "./find/find.product.usecase";
import ListProductUseCase from "./list/list.product.usecase";
import UpdateProductUseCase from "./update/update.customer.usecase";

describe("Integration test for product use cases", () => {
    let sequelize: Sequelize;

    beforeEach(async () => {
        sequelize = new Sequelize({
            dialect: "sqlite",
            storage: ":memory:",
            logging: false,
            sync: { force: true },
        });

        await sequelize.addModels([ProductModel]);
        await sequelize.sync();
    });

    afterEach(async () => {
        await sequelize.close();
    });

    it("should find a product", async () => {
        const productRepository = new ProductRepository();
        const usecase = new FindProductUseCase(productRepository);
        const product = ProductFactory.createNewProduct("Product A", 123);
        await productRepository.create(product);

        const input = {
            id: product.id,
        };

        const output = {
            id: product.id,
            name: "Product A",
            price: 123
        };

        const result = await usecase.execute(input);

        expect(result).toEqual(output);
    });

    it("should update a product", async () => {
        const productRepository = new ProductRepository();
        const usecase = new UpdateProductUseCase(productRepository);
        const product = ProductFactory.createNewProduct("Product A", 123);
        await productRepository.create(product);

        const input = {
            id: product.id,
            name: "Product B",
            price: 456,
        };

        const output = await usecase.execute(input);
        expect(output).toEqual(input);
    });

    it("should update and list products", async () => {
        const productRepository = new ProductRepository();
        const useCase = new ListProductUseCase(productRepository);

        const product1 = ProductFactory.createNewProduct("Product A", 123);
        const product2 = ProductFactory.createNewProduct("Product B", 456);

        await productRepository.create(product1);
        await productRepository.create(product2);

        product1.changeName("Product C");
        product1.changePrice(789);
        await productRepository.update(product1);

        const output = await useCase.execute({});

        expect(output.products.length).toBe(2);
        expect(output.products[0].id).toBe(product1.id);
        expect(output.products[0].name).toBe(product1.name);
        expect(output.products[0].price).toBe(product1.price);

        expect(output.products[1].id).toBe(product2.id);
        expect(output.products[1].name).toBe(product2.name);
        expect(output.products[1].price).toBe(product2.price);
    });
});
