import { isEqual } from "radash"
import { distinctUntilChanged, filter, map, Observable, share, Subject, takeUntil } from "rxjs"
import { StateSubject } from "./state-subject"

export class Store<T extends Object> {
    private unsubscriber: Subject<void>
    private state: StateSubject<T>

    constructor(value: T, unsubscriber?: Subject<void>) {
        this.state = new StateSubject(value)
        this.unsubscriber = unsubscriber ?? new Subject<void>()
    }

    /**
     * Set one or more properties of the state.
     * @param value {T} The new state partial
     * @param sideEffectFn
     */
    setState(value: Partial<T>, sideEffectFn?: () => void): void {
        this.state.next({ ...this.state.value, ...value })
        sideEffectFn?.()
    }

    /**
     * Get the current value of the state.
     * @returns {T} The current state
     */
    getState(): T {
        return this.state.value
    }

    /**
     * Select a slice of the state.
     *
     * @param key {string} The key of the property to select
     * @param filterFn {function} (Optional) A function to filter the stream
     * @returns {Observable} An observable of the selected property
     */
    select<K extends keyof T>(key: K, filterFn?: (value: T[K]) => boolean): Observable<T[K]> {
        return this.state.value$.pipe(
            map((state) => state[key]),
            filter(filterFn ?? (() => true)),
            distinctUntilChanged((a, b) => isEqual(a, b)),
            share(),
            takeUntil(this.unsubscriber),
        )
    }

    /**
     * Select the entire state.
     * @returns {Observable} An observable of the entire state
     */
    selectAll(): Observable<T> {
        return this.state.value$.pipe(
            share(),
            takeUntil(this.unsubscriber),
        )
    }

    /**
     * Reset the state to its initial value.
     * @param sideEffectFn {function} (Optional) A function to execute after the state is reset
     */
    reset(sideEffectFn?: () => void): void {
        this.state.reset()
        sideEffectFn?.()
    }

    destroy(): void {
        this.unsubscriber.next()
        this.unsubscriber.complete()
    }
}

