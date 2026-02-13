import useSessionTimer from '../hooks/useSessionTimer';

const SessionTracker = () => {
    // determine if we should track. ideally, we track if user is logged in.
    // the hook 'usesessiontimer' already checks for 'user' internally before saving.
    // so we can just set it to active=true.
    useSessionTimer(true);
    return null;
};

export default SessionTracker;
