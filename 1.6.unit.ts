import chai from 'chai';
import { Task } from './index';

const task = new Task();

describe('Test TODO', () => {
  it('Publish a new task', async () => {
    const item = task.postTask({ title: 'string', text: 'string' });
    chai.assert.exists(item, 'task not defined');
  });

  it('detail test for publish a new task', async () => {
    const item = task.postTask({ title: 'string', text: 'string' });
    chai.assert.exists(item.id, 'task.id not defined');
    chai.assert.exists(item.title, 'task.title not defined');
    chai.assert.exists(item.text, 'task.text not defined');
    chai.assert.exists(item.completed, 'task.complited not defined');
    chai.assert.exists(item.timestamp, 'task.timestMP not defined');
    chai.assert.exists(item.updateOn, 'task.updeteOn not defined');
  });

  it('Find task by id', async () => {
    const item = task.getTask(task.list[0].id);
    chai.assert.exists(item, 'task not found');
  });

  it('Update tasks title and text by id', async () => {
    const item = task.putTask(task.list[0].id, { title: 'a', text: 'b' });
    chai.assert.equal(item.title, 'a');
    chai.assert.equal(item.text, 'b');
  });

  it('Delete task by id', () => {
    const check = task.deleteTask(task.list[0].id);
    chai.assert.equal(task.list.length, 1);
    chai.assert.notEqual(check.id, task.list[0].id);
  });

  it('Show all task', async () => {
    const item = task.getTasks();
    chai.assert.exists(item, 'tasks not defined');
  });
});
