const { Client } = require('pg');

async function seedPhotoGrid() {
    const client = new Client({
        connectionString: 'postgresql://postgres.hmxbmddejuvwvqofggne:OKKINxw8922y9PF0@aws-1-eu-west-1.pooler.supabase.com:5432/postgres',
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected...');

        // Delete old photo-grid if exists
        await client.query(`DELETE FROM templates WHERE template_key = 'photo-grid-9'`);

        // 9-photo grid: 3 rows x 3 cols, each cell 400x400px, 2px gap, 20px padding
        // Canvas: 1260x1400 (grid=1260px wide + bottom text area)
        const GAP = 8;
        const PADDING = 20;
        const CELL_W = 400;
        const CELL_H = 400;

        const slots = [];
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const idx = row * 3 + col;
                slots.push({
                    id: `photo-${idx + 1}`,
                    type: 'image',
                    x: PADDING + col * (CELL_W + GAP),
                    y: PADDING + row * (CELL_H + GAP),
                    w: CELL_W,
                    h: CELL_H,
                    required: true,
                    label: `Photo ${idx + 1}`
                });
            }
        }

        const textFields = [
            {
                id: 'title',
                type: 'text',
                x: PADDING,
                y: PADDING + 3 * CELL_H + 2 * GAP + 20,
                w: 1220,
                h: 60,
                required: false,
                label: 'Titre (nom de famille, date...)',
                font: 'Georgia',
                size: 48,
                maxChars: 50
            },
            {
                id: 'subtitle',
                type: 'text',
                x: PADDING,
                y: PADDING + 3 * CELL_H + 2 * GAP + 90,
                w: 1220,
                h: 40,
                required: false,
                label: 'Sous-titre (dates, citation...)',
                font: 'Arial',
                size: 28,
                maxChars: 80
            }
        ];

        const definition = {
            canvasSize: { width: 1260, height: 1420 },
            dpi: 300,
            printSizeCm: { w: 40, h: 50 },
            slots,
            textFields
        };

        await client.query(`
            INSERT INTO templates (id, template_key, name, category, definition, thumbnail_url, active)
            VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, true)
        `, [
            'photo-grid-9',
            'Grille 9 Photos',
            'grid',
            JSON.stringify(definition),
            'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=400&auto=format&fit=crop'
        ]);

        console.log('✅ 9-photo grid template seeded successfully!');
        console.log(`   Slots: ${slots.length} photo slots`);
        console.log(`   Canvas: ${definition.canvasSize.width}x${definition.canvasSize.height}px`);
        console.log(`   Print: ${definition.printSizeCm.w}x${definition.printSizeCm.h} cm @ 300 DPI`);

    } catch (err) {
        console.error('Seed failed:', err);
    } finally {
        await client.end();
    }
}

seedPhotoGrid();
