import http from 'http';

const routes = [
  '/',
  '/about',
  '/catalog',
  '/catalog/1',
  '/login',
  '/price-comparison',
  '/track',
  '/dashboard',
  '/dashboard/officer',
  '/dashboard/officer/pr',
  '/dashboard/officer/rfq',
  '/dashboard/officer/po',
  '/dashboard/officer/analytics',
  '/dashboard/officer/catalog',
  '/dashboard/officer/evaluations',
  '/dashboard/approver',
  '/dashboard/approver/analytics',
  '/dashboard/approver/forms',
  '/dashboard/approver/history',
  '/dashboard/approver/reports',
  '/dashboard/approver/workflows',
  '/dashboard/end-user',
  '/dashboard/end-user/pr',
  '/dashboard/end-user/pr/new',
  '/dashboard/end-user/ppmp',
  '/dashboard/end-user/evaluation',
  '/dashboard/supplier-profiles',
  '/end-user',
  '/end-user/ppmp',
  '/unauthorized',
];

async function checkRoute(route: string) {
  return new Promise<{ route: string; status: number }>((resolve) => {
    http.get(`http://localhost:3000${route}`, (res) => {
      resolve({ route, status: res.statusCode || 0 });
    }).on('error', () => {
      resolve({ route, status: 500 });
    });
  });
}

async function main() {
  console.log('Testing all routes on http://localhost:3000...');
  for (const r of routes) {
    const res = await checkRoute(r);
    console.log(`${res.status === 200 ? '✅' : res.status === 307 || res.status === 302 || res.status === 308 ? '↪️' : '❌'} ${res.status} ${res.route}`);
  }
}

main();
