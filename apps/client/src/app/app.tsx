import { RouterProvider } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { router } from '../router';

export function App() {
  return (
    <>
      <RouterProvider router={router} />
      {import.meta.env.DEV ? (
        <TanStackRouterDevtools router={router} position="bottom-right" />
      ) : null}
    </>
  );
}

export default App;
