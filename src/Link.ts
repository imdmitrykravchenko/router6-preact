import { createElement, JSX, Component, ComponentChild } from 'preact';
import url from 'url';
import Router6, { RouteParams, Query, Route } from 'router6';

import { RouterConsumer } from './context';

export type LinkProps = Omit<JSX.HTMLAttributes, 'children'> & {
  children:
    | ComponentChild
    | ((payload: { route: Route; currentRoute: Route }) => ComponentChild);
  to?: string;
  params?: RouteParams;
  query?: Query;
  tagName?: string;
  onClick?: (e: MouseEvent, route: Route) => Promise<any> | any;
};

const getRoute = (
  router: Router6,
  {
    to,
    params,
    href,
    query,
  }: {
    to?: string;
    href?: string;
    params?: RouteParams;
    query?: Query;
  },
) => {
  let route = null;

  if (to) {
    route = router.findRoute(to, { params, query });
  }

  if (!route && href) {
    route = router.matchPath(href);
  }

  return [
    route,
    href || (route && url.format({ pathname: route.path, query })),
  ];
};

type InnerLinkProps = LinkProps & {
  router: Router6;
};

class InnerLink extends Component<InnerLinkProps, {}> {
  handleClick = (e: MouseEvent) => {
    const { to, onClick, router, query, params, href } = this.props;
    const [route] = getRoute(router, {
      to,
      params,
      query,
      href: String(href),
    });
    let defaultPrevented = false;
    const { preventDefault } = e;

    e.preventDefault = () => {
      preventDefault.call(e);
      defaultPrevented = true;
    };
    const clickProcess = onClick && onClick(e, route);

    const navigate = (process, payload) => {
      const resultRoute: Route = payload?.route || route;

      if (process && resultRoute) {
        e.preventDefault();
        router.navigateToRoute(resultRoute.name, {
          params: resultRoute.params,
          query: resultRoute.query,
          state: payload?.state,
        });
      }
    };

    if (clickProcess) {
      if (clickProcess.then) {
        clickProcess.then((payload) => navigate(true, payload));
      } else {
        navigate(true, clickProcess);
      }
    } else {
      navigate(!defaultPrevented, null);
    }
  };

  render() {
    const {
      to,
      params,
      query,
      onClick,
      children,
      tagName: TagName = 'a',
      router,
      href: propsHref,
      ...props
    } = this.props;
    const [route, href] = getRoute(router, {
      to,
      params,
      query,
      href: String(propsHref),
    });

    return createElement(
      TagName,
      { ...props, href, onClick: this.handleClick },
      typeof children === 'function'
        ? children({ route, currentRoute: router.currentRoute })
        : children,
    );
  }
}

const Link = (props: LinkProps) =>
  createElement(RouterConsumer, {
    children: (router) => createElement(InnerLink, { ...props, router }),
  });

export default Link;
