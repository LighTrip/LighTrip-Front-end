type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribeSearchTabPress(listener: Listener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function emitSearchTabPress() {
    listeners.forEach((listener) => listener());
}
