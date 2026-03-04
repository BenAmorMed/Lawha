
const { DataSource } = require('typeorm');
const path = require('path');

async function seed() {
    const dataSource = new DataSource({
        type: 'postgres',
        host: 'aws-1-eu-west-1.pooler.supabase.com',
        port: 5432,
        username: 'postgres.hmxbmddejuvwvqofggne',
        password: 'OKKINxw8922y9PF0',
        database: 'postgres',
        ssl: { rejectUnauthorized: false },
        entities: [path.join(__dirname, 'dist/**/*.entity.js')],
    });

    try {
        await dataSource.initialize();
        console.log('Seeding...');

        const productRepo = dataSource.getRepository('Product');
        const sizeRepo = dataSource.getRepository('ProductSize');
        const frameRepo = dataSource.getRepository('FrameOption');
        const templateRepo = dataSource.getRepository('Template');

        // 1. Product
        const product = productRepo.create({
            name: 'Canvas Print',
            description: 'Premium stretched canvas print',
            basePrice: 29.90,
            category: 'canvas',
            isActive: true
        });
        const savedProduct = await productRepo.save(product);
        console.log('Product saved:', savedProduct.id);

        // 2. Sizes
        const sizes = [
            { label: '20x30', widthCm: 20, heightCm: 30, priceDelta: 0, productId: savedProduct.id },
            { label: '30x40', widthCm: 30, heightCm: 40, priceDelta: 10, productId: savedProduct.id }
        ];
        await sizeRepo.save(sizeRepo.create(sizes));
        console.log('Sizes saved.');

        // 3. Frames
        const frames = [
            { label: 'No Frame', priceDelta: 0, productId: savedProduct.id },
            { label: 'Black Wood', priceDelta: 15, productId: savedProduct.id }
        ];
        await frameRepo.save(frameRepo.create(frames));
        console.log('Frames saved.');

        // 4. Template
        const template = templateRepo.create({
            templateKey: 'loveflix-01',
            name: 'Loveflix Movie Poster',
            category: 'couple',
            definition: {
                canvasSize: { width: 5905, height: 8268 },
                dpi: 300,
                slots: [
                    { id: 'img1', x: 0, y: 0, w: 5905, h: 6000, type: 'image' }
                ]
            },
            isActive: true
        });
        await templateRepo.save(template);
        console.log('Template saved.');

        console.log('Seed finished successfully.');

    } catch (err) {
        console.error('Seed failed:', err);
    } finally {
        await dataSource.destroy();
    }
}

seed();
