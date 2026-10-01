# Музей для Мэри — MVP

Минимальная версия интерактивного 3D-музея на React, Vite, TypeScript, Three.js и React Three Fiber.

## Запуск

```bash
npm install
npm run dev
```

Откройте адрес Vite, нажмите «Войти в музей» и используйте:

- `WASD` или стрелки — движение;
- мышь — горизонтальный и вертикальный обзор;
- `Esc` — освободить курсор и поставить игру на паузу.

Центральная картина на дальней стене оживает, когда игрок подходит к ней ближе чем на 4,5 метра и смотрит в её сторону. При отдалении, отведении взгляда или выходе из режима управления воспроизведение останавливается.

## Структура

- `src/player/PlayerController.tsx` — FPS-управление и коллизии с границами комнаты;
- `src/museum/config.ts` — типы и геометрические параметры комнат;
- `public/objects.json` — позиции, размеры и метаданные картин и музейных табличек;
- `src/museum/GalleryRoom.tsx` — геометрия комнаты;
- `src/museum/CeilingSkylight.tsx` — стеклянный потолочный плафон, сетка и молдинги;
- `src/museum/MuseumLighting.tsx` — верхний AreaLight и направленные музейные споты;
- `src/museum/Painting.tsx` — обычная картина и рама;
- `src/components/MuseumPainting.tsx` — переиспользуемая картина с физической рамой и пресетами `simpleGold`, `ornateGold`, `darkWood`;
- `src/components/Door.tsx` — переиспользуемая дверь с петлёй, плавным открытием и подсказкой взаимодействия;
- `src/components/RoomSign.tsx` — двусторонние музейные обозначения залов около дверного проёма;
- `src/museum/SecondRoom.tsx` — второй зал в том же Three.js-мире;
- `src/player/collisionWorld.ts` — статические стены и динамические коллайдеры дверей;
- `src/museum/LivingPainting.tsx` — активация видеотекстуры по дистанции и полю зрения.
- `public/floor.jpg` и `public/wall.jpg` — текстуры пола и стен.
- `public/portrait_1.jpg` — первая фотография из коллекции.

Следующие комнаты и интерактивные объекты можно добавлять отдельными компонентами и конфигурациями, не меняя контроллер игрока. Будущие механики намеренно не входят в этот MVP.

## Настройка картин

Экспонаты и таблички настраиваются в `public/objects.json`. Файлы изображений кладутся в `public`, поэтому `public/portrait_1.jpg` записывается в конфиге как `/portrait_1.jpg`.

```json
{
  "id": "portrait-mary",
  "position": [-3.7, 2.4, -7.84],
  "rotation": [0, 0, 0],
  "size": [1.65, 2.2],
  "image": "/portrait_1.jpg",
  "title": "Портрет Мэри",
  "year": "2026",
  "description": "Описание экспоната",
  "note": "Архивная ремарка",
  "frame": "ornate",
  "frameImage": "/ornate-golden-picture-frame-classic-decor-element.png",
  "frameSize": [4.05, 4.05],
  "labelPosition": [0, -1.7, 0.055],
  "labelSize": [2.75, 0.8],
  "video": "/memory.mp4",
  "link": "https://example.com"
}
```

`position` задаёт координаты `[x, y, z]`, `rotation` — поворот в радианах, а `size` — ширину и высоту картины. `labelPosition` задаёт локальную позицию подписи относительно центра картины, а `labelSize` — её ширину и высоту. `frame` может быть `classic` или `ornate`; для декоративной рамки используются `frameImage` и `frameSize`. Поля `video` и `link` уже предусмотрены в типе конфигурации, но будут задействованы, когда появится интерфейс взаимодействия с экспонатом.
