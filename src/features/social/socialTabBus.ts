type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribeSocialTabPress(listener: Listener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function emitSocialTabPress() {
    listeners.forEach((listener) => listener());
}
