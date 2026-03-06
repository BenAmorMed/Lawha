
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
        console.log('Seeding Demo Data...');

        const productRepo = dataSource.getRepository('Product');
        const sizeRepo = dataSource.getRepository('ProductSize');
        const frameRepo = dataSource.getRepository('FrameOption');
        const templateRepo = dataSource.getRepository('Template');

        console.log('Cleaning existing demo data (if any)...');
        await sizeRepo.delete({});
        await frameRepo.delete({});
        await productRepo.delete({});
        await templateRepo.delete({});

        // --- PRODUCTS ---
        console.log('Inserting rich products...');
        const p1 = await productRepo.save(productRepo.create({
            name: 'Toile Photo Classique',
            description: 'Impression sur toile de qualité galerie, tendue sur un châssis en bois véritable. Idéal pour vos plus beaux souvenirs.',
            basePrice: 39.90,
            category: 'canvas',
            imageUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1000&auto=format&fit=crop',
            isActive: true
        }));

        const p2 = await productRepo.save(productRepo.create({
            name: 'Poster Premium Encadré',
            description: 'Affiche imprimée sur papier d\'art 250g mat, protégée par un verre acrylique et un cadre élégant.',
            basePrice: 29.90,
            category: 'poster',
            imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1000&auto=format&fit=crop',
            isActive: true
        }));

        const p3 = await productRepo.save(productRepo.create({
            name: 'Plaque Acrylique Spotify',
            description: 'Votre chanson préférée immortalisée sur une plaque en verre acrylique transparente et brillante.',
            basePrice: 49.90,
            category: 'acrylic',
            imageUrl: 'https://images.unsplash.com/photo-1621619892591-23f211516e8b?q=80&w=1000&auto=format&fit=crop',
            isActive: true
        }));

        // --- SIZES ---
        await sizeRepo.save(sizeRepo.create([
            { label: 'Petit (20x30 cm)', widthCm: 20, heightCm: 30, priceDelta: 0, productId: p1.id },
            { label: 'Moyen (30x40 cm)', widthCm: 30, heightCm: 40, priceDelta: 15, productId: p1.id },
            { label: 'Grand (50x70 cm)', widthCm: 50, heightCm: 70, priceDelta: 40, productId: p1.id },
            { label: 'A4 (21x29.7 cm)', widthCm: 21, heightCm: 29.7, priceDelta: 0, productId: p2.id },
            { label: 'A3 (29.7x42 cm)', widthCm: 29.7, heightCm: 42, priceDelta: 10, productId: p2.id },
            { label: 'Standard (15x20 cm)', widthCm: 15, heightCm: 20, priceDelta: 0, productId: p3.id }
        ]));

        // --- FRAMES ---
        await frameRepo.save(frameRepo.create([
            { label: 'Sans cadre extérieur', priceDelta: 0, productId: p1.id },
            { label: 'Caisse Américaine Noire', priceDelta: 25, productId: p1.id },
            { label: 'Caisse Américaine Bois', priceDelta: 30, productId: p1.id },
            { label: 'Cadre Noir Mat', priceDelta: 0, productId: p2.id },
            { label: 'Cadre Blanc Mat', priceDelta: 0, productId: p2.id },
            { label: 'Cadre Chêne Clair', priceDelta: 5, productId: p2.id }
        ]));

        // --- TEMPLATES ---
        console.log('Inserting rich templates...');
        await templateRepo.save(templateRepo.create([
            {
                templateKey: 'loveflix-01',
                name: 'Modèle Loveflix',
                category: 'couple',
                thumbnailUrl: 'https://images.unsplash.com/photo-1585951237318-9ea5e175b891?q=80&w=400&auto=format&fit=crop',
                definition: {
                    canvasSize: { width: 1200, height: 1600 },
                    dpi: 300,
                    slots: [
                        { id: 'img1', type: 'image', x: 0, y: 0, w: 1200, h: 1000, required: true, label: 'Photo principale' }
                    ],
                    textFields: [
                        { id: 'title', font: 'Arial', size: 80, x: 100, y: 1100, required: true, label: 'Titre du film' },
                        { id: 'subtitle', font: 'Courier', size: 40, x: 100, y: 1250, required: false, label: 'Sous-titre (acteurs, date...)' }
                    ]
                },
                active: true
            },
            {
                templateKey: 'spotify-01',
                name: 'Modèle Spotify',
                category: 'music',
                thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&auto=format&fit=crop',
                definition: {
                    canvasSize: { width: 1000, height: 1500 },
                    dpi: 300,
                    slots: [
                        { id: 'cover', type: 'image', x: 100, y: 100, w: 800, h: 800, required: true, label: 'Pochette de l\'album' }
                    ],
                    textFields: [
                        { id: 'song', font: 'Helvetica', size: 60, x: 100, y: 1000, required: true, label: 'Titre de la chanson' },
                        { id: 'artist', font: 'Helvetica', size: 40, x: 100, y: 1100, required: true, label: 'Artiste' }
                    ]
                },
                active: true
            }
        ]));

        console.log('Demo SEED finished successfully!');

    } catch (err) {
        console.error('Seed failed:', err);
    } finally {
        await dataSource.destroy();
    }
}

seed();
