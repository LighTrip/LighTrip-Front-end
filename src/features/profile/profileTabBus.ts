type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribeProfileTabPress(listener: Listener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function emitProfileTabPress() {
    listeners.forEach((listener) => listener());
}
