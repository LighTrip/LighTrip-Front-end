type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribePassportTabPress(listener: Listener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function emitPassportTabPress() {
    listeners.forEach((listener) => listener());
}
