type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribeMapTabPress(listener: Listener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function emitMapTabPress() {
    listeners.forEach((listener) => listener());
}
