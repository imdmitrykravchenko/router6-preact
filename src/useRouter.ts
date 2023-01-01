import { useContext, useEffect, useState } from 'preact/hooks';

import context from './context';

export const useRouter = () => {
  const router = useContext(context);
  const [_, forceUpdate] = useState({});

  useEffect(() => {
    const unsubscribe = router.listen('finish', () => {
      forceUpdate({});
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return router;
};

export default useRouter;
