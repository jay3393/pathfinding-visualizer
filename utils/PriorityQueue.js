// Priority Queue Data Structure
// Referenced from geeksforgeeks @ https://www.geeksforgeeks.org/implementation-priority-queue-javascript/

// Queue Element
export class QE {
    constructor(element, priority)
    {
        this.element = element;
        this.priority = priority;
    }
}

// Priority Queue
export class PQueue {
    constructor() {
        this.queue = [];
    }

    // Enqueue
    enqueue(element, priority) {
        const qe = new QE(element, priority);
        let i = 0;
        
        // Increment i until the i'th index of queue has a bigger priority than the to-be-inserted queue element
        while (i < this.queue.length && this.queue[i].priority <= qe.priority) {
            i++;
        }

        // Insert queue element in i'th index
        this.queue.splice(i, 0, qe);
    }

    // Dequeue
    dequeue() {
        if (this.isEmpty()) return null;
        return this.queue.shift();
    }

    // IsEmpty
    isEmpty() {
        if (this.queue.length === 0) return true;
        return false;
    }
}

// const pqueue = new PQueue();
// pqueue.enqueue(1, 1);
// pqueue.enqueue(3, 3);
// pqueue.enqueue(2, 2);
// pqueue.enqueue('A', 1);
// console.log(pqueue.queue);
// console.log(pqueue.dequeue());
// console.log(pqueue.dequeue());
