import { filter, map, Observable, Subject, takeUntil } from "rxjs"
import { StateSubject } from "./state-subject"

export class Store<T extends Object> {
    private unsubscriber: Subject<void>
    private state: StateSubject<T>

    constructor(value: T, unsubscriber?: Subject<void>) {
        this.state = new StateSubject(value)
        this.unsubscriber = unsubscriber ?? new Subject<void>()
    }

    setState(value: Partial<T>, sideEffectFn?: () => void): void {
        this.state.next({ ...this.state.value, ...value })
        sideEffectFn?.()
    }

    select<K extends keyof T>(key: K, filterFn?: (value: T[K]) => boolean): Observable<T[K]> {
        return this.state.value$.pipe(
            map((state) => state[key]),
            filter(filterFn ?? (() => true)),
            takeUntil(this.unsubscriber),
        )
    }

    selectAll(): Observable<T> {
        return this.state.value$
    }

    reset(sideEffectFn?: () => void): void {
        this.state.reset()
        sideEffectFn?.()
    }
}
