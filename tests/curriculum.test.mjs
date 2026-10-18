import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stat, readFile } from 'node:fs/promises';
import { curricula } from '../src/academy/curriculum.mjs';
import { programs, schedule } from '../src/academy/content.mjs';

test('curriculum includes all 17 distinct optimized images and existing program IDs', async () => {
  assert.deepEqual(Object.keys(curricula), programs.map(p => p.id));
  assert.deepEqual(Object.values(curricula).map(p => p.parts.length), [7, 8, 8]);
  const images = Object.values(curricula).flatMap(p => p.parts.filter(part => !part.video).map(part => part.image));
  assert.equal(new Set(images).size, 17);
  for (const image of images) {
    const data = await readFile(image);
    assert.equal(data.toString('ascii', 0, 4), 'RIFF');
    assert.equal(data.toString('ascii', 8, 12), 'WEBP');
    assert.ok((await stat(image)).size < 400_000, `${image} should be lightweight`);
  }
});

test('program detail times match the published timetable', () => {
  for (const program of programs) {
    const expected = schedule.filter(row => row[1] === program.name).map(row => row[0]);
    assert.deepEqual(curricula[program.id].times, expected);
  }
});

 test('each class begins with two distinct playable MP4 assets and WebP posters', async () => {
  const videos = [];
  for (const lesson of Object.values(curricula)) {
    assert.ok(lesson.parts.slice(0, 2).every(part => part.video));
    assert.ok(lesson.parts.slice(2).every(part => !part.video));
    for (const part of lesson.parts.slice(0, 2)) {
      videos.push(part.video);
      const data = await readFile(part.video);
      assert.equal(data.toString('ascii', 4, 8), 'ftyp');
      assert.ok(data.length < 8_000_000);
      const poster = await readFile(part.image);
      assert.equal(poster.toString('ascii', 8, 12), 'WEBP');
    }
  }
  assert.equal(new Set(videos).size, 6);
});
