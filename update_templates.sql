UPDATE templates SET definition = '{
  "canvasSize": { "width": 5905, "height": 8268 },
  "dpi": 300,
  "printSizeCm": { "w": 50, "h": 70 },
  "slots": [
    {
      "id": "img1",
      "type": "image",
      "x": 0, "y": 0,
      "w": 5905, "h": 5500,
      "required": true,
      "label": "Photo principale"
    }
  ],
  "textFields": [
    {
      "id": "title",
      "x": 200, "y": 5700,
      "font": "Cinzel",
      "size": 180,
      "maxChars": 30,
      "required": true,
      "label": "Titre (ex: Sarah & Ahmed)"
    },
    {
      "id": "subtitle",
      "x": 200, "y": 5950,
      "font": "Montserrat",
      "size": 100,
      "maxChars": 40,
      "required": false,
      "label": "Sous-titre (ex: Est. June 2019)"
    },
    {
      "id": "date",
      "x": 200, "y": 6150,
      "font": "Lato",
      "size": 80,
      "maxChars": 30,
      "required": false,
      "label": "Date (ex: Season 1, Episode 1)"
    }
  ]
}'::jsonb
WHERE template_key = 'loveflix-01';

UPDATE templates SET definition = '{
  "canvasSize": { "width": 5905, "height": 8268 },
  "dpi": 300,
  "printSizeCm": { "w": 50, "h": 70 },
  "slots": [
    { "id": "img1", "type": "image", "x": 100, "y": 100,
      "w": 1835, "h": 1835, "required": true },
    { "id": "img2", "type": "image", "x": 2035, "y": 100,
      "w": 1835, "h": 1835, "required": true },
    { "id": "img3", "type": "image", "x": 3970, "y": 100,
      "w": 1835, "h": 1835, "required": true },
    { "id": "img4", "type": "image", "x": 100, "y": 2035,
      "w": 1835, "h": 1835, "required": true },
    { "id": "img5", "type": "image", "x": 2035, "y": 2035,
      "w": 1835, "h": 1835, "required": true },
    { "id": "img6", "type": "image", "x": 3970, "y": 2035,
      "w": 1835, "h": 1835, "required": true },
    { "id": "img7", "type": "image", "x": 100, "y": 3970,
      "w": 1835, "h": 1835, "required": true },
    { "id": "img8", "type": "image", "x": 2035, "y": 3970,
      "w": 1835, "h": 1835, "required": true },
    { "id": "img9", "type": "image", "x": 3970, "y": 3970,
      "w": 1835, "h": 1835, "required": true }
  ],
  "textFields": [
    {
      "id": "title",
      "x": 200, "y": 6050,
      "font": "Playfair Display",
      "size": 160,
      "maxChars": 25,
      "required": false,
      "label": "Titre (ex: Notre famille)"
    },
    {
      "id": "signature",
      "x": 200, "y": 6280,
      "font": "Dancing Script",
      "size": 120,
      "maxChars": 40,
      "required": false,
      "label": "Signature (ex: Avec amour)"
    }
  ]
}'::jsonb
WHERE template_key = '3x3-grid';

UPDATE templates SET definition = '{
  "canvasSize": { "width": 5905, "height": 8268 },
  "dpi": 300,
  "printSizeCm": { "w": 50, "h": 70 },
  "slots": [
    {
      "id": "img1",
      "type": "image",
      "x": 952, "y": 800,
      "w": 4000, "h": 4000,
      "required": true,
      "label": "Photo principale"
    }
  ],
  "textFields": [
    {
      "id": "title",
      "x": 200, "y": 5100,
      "font": "Playfair Display",
      "size": 180,
      "maxChars": 25,
      "required": true,
      "label": "Nom (ex: Ahmed)"
    },
    {
      "id": "subtitle",
      "x": 200, "y": 5380,
      "font": "Lato",
      "size": 100,
      "maxChars": 50,
      "required": false,
      "label": "Message (ex: Pour toujours)"
    }
  ]
}'::jsonb
WHERE template_key = 'central-hero';
