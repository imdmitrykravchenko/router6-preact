import { createContext, createElement, ComponentChildren } from 'preact';
import Router6 from 'router6';

const context = createContext<Router6>(null);

export const RouterProvider = ({
  router,
  children,
}: {
  router: Router6;
  children: ComponentChildren;
}) => createElement(context.Provider, { value: router, children });

export const RouterConsumer = context.Consumer;

export default context;
