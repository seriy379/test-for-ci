import chai from 'chai';
import supertest from 'supertest';
import { app } from '../1.6';

let firstId: string = '';

describe('Test TODO-server', () => {
  it('POST /task - status 201', async () => {
    const response = await supertest(app)
      .post('/task')
      .send({ title: 'string', text: 'string' })
      .expect(201);
    const firstTask = JSON.parse(response.text);
    firstId = firstTask.id;
    chai.assert.equal(response.status, 201);
  });

  it('POST /task - status 400', async () => {
    const response = await supertest(app)
      .post('/task')
      .send({ title: 1, text: 2 })
      .expect(400);
    chai.assert.isOk(response.text.startsWith('Invalid input data'));
  });

  it('GET /task/:id - status 200', async () => {
    const response = await supertest(app)
      .get(`/task/${firstId}`)
      .expect(200);
    const answer = JSON.parse(response.text);
    chai.assert.equal(answer.id, firstId);
    chai.assert.equal(response.status, 200);
  });

  it('PUT /task - status 201', async () => {
    const response = await supertest(app)
      .put(`/task/${firstId}`)
      .send({ title: 'updateTitle', text: 'updateText' })
      .expect(201);
    const updateTask = JSON.parse(response.text);
    const title: string = updateTask.title;
    const text: string = updateTask.text;
    const completed: boolean = updateTask.completed;
    const timestamp: number = updateTask.timestamp;
    const updateOn: number = updateTask.updateOn;

    chai.assert.equal(title, 'updateTitle');
    chai.assert.equal(text, 'updateText');
    chai.assert.equal(completed, true);
    chai.assert.isOk(timestamp < updateOn);
  });

  it('GET /tasks - status 200', async () => {
    const response = await supertest(app)
      .get('/tasks')
      .expect(200);
    chai.assert.equal(JSON.parse(response.text).length, 1);
  });

  it('DELETE /task/:id - status 200', async () => {
    const response = await supertest(app)
      .delete(`/task/${firstId}`)
      .expect(200);
    const answer = JSON.parse(response.text);
    chai.assert.equal(answer.id, firstId);
    chai.assert.exists(response.text);

  });
});
