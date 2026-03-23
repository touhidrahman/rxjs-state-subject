# RxJS-State-Subject

An extended BehaviorSubject that can be reset to its initial value. The stream of change is checked for deep equality so that only when the value has trully changed, the stream will emit.
 
### Installation

```
npm install rxjs-state-subject
```

### Usage of StateSubject

```typescript
import { StateSubject } from 'rxjs-state-subject';

export class TitleStateService {
    private title = new StateSubject<string>('Hello initial title!');

    public updateTitle(title: string): void {
        this.title.update(title);
    }

    public resetTitle(): void {
        this.title.reset();
    }

    // Subscribe to title value changes to trigger side effects
    constructor() {
        this.handleEffects();
    }

    private handleEffects(): void {
        this.title.value$.subscribe(title => console.log('Title changed!'));
    }
}
```

Use more StateSubjects in your service for more complex state management.
