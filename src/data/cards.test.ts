import test from 'node:test';
import assert from 'node:assert/strict';
import { CYTOLOGY_CARDS, CATEGORIES } from './cards';

test('dataset contains all required cytology revision cards', () => {
  assert.ok(CYTOLOGY_CARDS.length >= 45, `Expected >= 45 cards, got ${CYTOLOGY_CARDS.length}`);
});

test('each card has valid properties, bullet points, and image paths', () => {
  for (const card of CYTOLOGY_CARDS) {
    assert.ok(card.id, 'Card must have an ID');
    assert.ok(card.page > 0, `Card ${card.id} must have a positive page number`);
    assert.ok(card.title, `Card ${card.id} must have a title`);
    assert.ok(card.question, `Card ${card.id} must have a question`);
    assert.ok(card.answer, `Card ${card.id} must have an answer`);
    assert.ok(card.answerBullets.length > 0, `Card ${card.id} must have bullet points`);
    assert.ok(card.croppedImage.startsWith('/crops/'), `Card ${card.id} croppedImage must start with /crops/`);
    assert.ok(card.fullImage.startsWith('/slides/'), `Card ${card.id} fullImage must start with /slides/`);
    assert.ok(card.image.startsWith('/crops/') || card.image.startsWith('/slides/'), `Card ${card.id} image must be valid path`);
  }
});
