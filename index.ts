import express, { Request, Response } from 'express';
import Ajv from 'ajv';

interface ITask {
  id: string;
  title: string;
  text: string;
  completed: boolean;
  timestamp: number;
  updateOn: number;
}

interface IUpdateKeys {
  title: string;
  text: string;
}

class BaseError extends Error {
  public type!: string;
}

class UserError extends BaseError {
  public type = 'NotFound';

  constructor(id: string) {
    super(`Task with id: ${id} not found`);
  }
}
class InvalidSchema extends BaseError {
  constructor(name: string, ajvErr: any) {
    let message = 'Invalid input data \n';

    for (let i = 0; i < ajvErr.length; i += 1) {
      message += `\t ${name}${ajvErr[i].dataPath} ${ajvErr[i].message} \n`;
    }

    super(message);
    this.type = 'InvalidSchema';
  }
}

export class Task {
  public list: ITask[] = [];
  private chars: string =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  public getTask(id: string): ITask {
    return this.findID(id);
  }

  public postTask(data: any): ITask {
    const newTask: ITask = {
      id: this.generateId(),
      title: data.title,
      text: data.text,
      completed: false,
      timestamp: new Date().getTime(),
      updateOn: new Date().getTime(),
    };
    this.list.push(newTask);
    return newTask;
  }

  public getTasks(): ITask[] {
    return this.list;
  }

  public deleteTask(id: string): ITask {
    const deletedTask: ITask = this.findID(id);
    this.list.splice(this.list.indexOf(deletedTask), 1);
    return deletedTask;
  }

  public putTask(id: string, data: Partial<IUpdateKeys>): ITask {
    const changeableTask: ITask = this.findID(id);
    Object.assign(changeableTask, data);
    changeableTask.updateOn = new Date().getTime();
    changeableTask.completed = true;
    return changeableTask;
  }

  private generateId(): string {
    let id: string = '';
    for (let i: number = 0; i < 10; i += 1) {
      id += this.chars.charAt(Math.floor(Math.random() * this.chars.length));
    }
    return id;
  }

  private findID(id: string): ITask {
    for (const item of this.list) {
      if (item.id === id) {
        return item;
      }
    }
    throw new UserError(id);
  }
}

const task = new Task();
const ajv = Ajv({ allErrors: true });
const schema: object = {
  type: 'object',
  required: ['title', 'text'],
  properties: {
    title: { type: 'string' },
    text: { type: 'string' },
  },
};

const schemaPartial: object = {
  type: 'object',
  minProperties: 1,
  properties: {
    title: { type: 'string' },
    text: { type: 'string' },
  },
};

const validate = ajv.compile(schema);
const validatePartial = ajv.compile(schemaPartial);

export const app = express();

app.use(express.json());

app.get('/task/:id', (req: Request, res: Response) => {
  const answer: ITask = task.getTask(req.params.id);
  if (answer) {
    res.status(200).send(JSON.stringify(answer, null, '  '));
  }
});

app.post('/task', (req: Request, res: Response) => {
  const valid: boolean | PromiseLike<any> = validate(req.body);
  if (valid) {
    res.status(201).send(JSON.stringify(task.postTask(req.body), null, '  '));
  } else {
    throw new InvalidSchema('task', validate.errors);
  }
});

app.get('/tasks', (req: Request, res: Response) => {
  res.status(200).send(JSON.stringify(task.getTasks(), null, '  '));
});

app.delete('/task/:id', (req: Request, res: Response) => {
  const answer: ITask =  task.getTask(req.params.id);
  if (answer) {
    task.getTask(req.params.id);
    res.status(200).send(JSON.stringify(answer, null, '  '));
  }
});

app.put('/task/:id', (req: Request, res: Response) => {
  const valid: boolean | PromiseLike<any> = validatePartial(req.body);
  if (valid) {
    const answer: ITask = task.putTask(req.params.id, req.body);
    if (answer) {
      res.status(201).send(JSON.stringify(answer, null, '  '));
    }
  } else {
    throw new InvalidSchema('task', validate.errors);
  }
});

app.use((err: BaseError, req: Request, res: Response, next: any) => {
  if (err.type === 'NotFound') {
    res.status(404).send(err.message);
  }
  if (err.type === 'InvalidSchema') {
    res.status(400).send(err.message);
  }
  if (!err.type) {
    console.log(err.message);
    res.status(500).send('Something went wrong =(');
  }
});

app.listen(3000, () => console.log('Server started'));
