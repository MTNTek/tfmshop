import { Router } from 'express';
import productRoutes from '../../src/routes/products';

describe('Product Routes Configuration', () => {
  let router: Router;

  beforeEach(() => {
    router = productRoutes;
  });

  it('should be a valid Express router', () => {
    expect(router).toBeDefined();
    expect(typeof router).toBe('function');
  });

  it('should have the correct route stack', () => {
    const routes = router.stack.map((layer: any) => ({
      method: layer.route?.methods,
      path: layer.route?.path,
    }));

    // Check that all expected routes are defined
    const expectedRoutes = [
      { method: { get: true }, path: '/' },
      { method: { get: true }, path: '/featured' },
      { method: { get: true }, path: '/search' },
      { method: { get: true }, path: '/slug/:slug' },
      { method: { get: true }, path: '/:id' },
      { method: { post: true }, path: '/' },
      { method: { put: true }, path: '/:id' },
      { method: { patch: true }, path: '/:id/stock' },
      { method: { delete: true }, path: '/:id' },
    ];

    expectedRoutes.forEach(expectedRoute => {
      const matchingRoute = routes.find(route => 
        route.path === expectedRoute.path && 
        JSON.stringify(route.method) === JSON.stringify(expectedRoute.method)
      );
      expect(matchingRoute).toBeDefined();
    });
  });

  it('should have middleware applied to admin routes', () => {
    const adminRoutes = router.stack.filter((layer: any) => {
      const path = layer.route?.path;
      const methods = layer.route?.methods;
      return (
        (path === '/' && methods?.post) ||
        (path === '/:id' && (methods?.put || methods?.delete)) ||
        (path === '/:id/stock' && methods?.patch)
      );
    });

    // Admin routes should have middleware (authentication, authorization, validation)
    adminRoutes.forEach((layer: any) => {
      expect(layer.route.stack.length).toBeGreaterThan(1); // Should have middleware + controller
    });
  });

  it('should have no middleware on public GET routes', () => {
    const publicRoutes = router.stack.filter((layer: any) => {
      const path = layer.route?.path;
      const methods = layer.route?.methods;
      return methods?.get && (
        path === '/' ||
        path === '/featured' ||
        path === '/search' ||
        path === '/slug/:slug' ||
        path === '/:id'
      );
    });

    // Public GET routes should only have the controller (no auth middleware)
    publicRoutes.forEach((layer: any) => {
      expect(layer.route.stack.length).toBe(1); // Only controller, no middleware
    });
  });

  it('should have routes in correct order for specificity', () => {
    const getRoutes = router.stack
      .filter((layer: any) => layer.route?.methods?.get)
      .map((layer: any) => layer.route.path);

    // More specific routes should come before generic ones
    const featuredIndex = getRoutes.indexOf('/featured');
    const searchIndex = getRoutes.indexOf('/search');
    const slugIndex = getRoutes.indexOf('/slug/:slug');
    const idIndex = getRoutes.indexOf('/:id');

    expect(featuredIndex).toBeLessThan(idIndex);
    expect(searchIndex).toBeLessThan(idIndex);
    expect(slugIndex).toBeLessThan(idIndex);
  });
});