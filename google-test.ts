import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AuthService } from './src/auth/auth.service';
import { UsersService } from './src/users/users.service';

async function run() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);
  const usersService = app.get(UsersService);

  let passed = 0;
  let failed = 0;

  function ok(label: string, result: any) {
    console.log(`\n✅ PASS — ${label}`);
    console.log('   Result:', typeof result === 'string' ? `token(${result.slice(0, 20)}...)` : result);
    passed++;
  }

  function fail(label: string, reason: string) {
    console.log(`\n❌ FAIL — ${label}`);
    console.log('   Reason:', reason);
    failed++;
  }

  const freshEmail = `oauth-test-${Date.now()}@example.com`;

  // ─── Scenario 1: New email, no area → must throw "Area is required" ───────
  try {
    await authService.googleLogin({
      user: { email: freshEmail, name: 'Test User' },
      accessToken: 'fake-access-token-1234567890',
      area: null,
    });
    fail('Scenario 1 (new email, no area)', 'Expected BadRequestException but got success');
  } catch (err) {
    if (err.message === 'Area is required to complete signup') {
      ok('Scenario 1 (new email, no area)', `Threw: "${err.message}"`);
    } else {
      fail('Scenario 1 (new email, no area)', `Wrong error: "${err.message}"`);
    }
  }

  // ─── Scenario 2: New email, valid area → must succeed ────────────────────
  try {
    const result = await authService.googleLogin({
      user: { email: freshEmail, name: 'Test User' },
      accessToken: 'fake-access-token-1234567890',
      area: '1', // area ID 1 (UAE)
    });
    if (result && typeof result === 'string') {
      ok('Scenario 2 (new email, valid area)', result);
    } else {
      fail('Scenario 2 (new email, valid area)', `Unexpected result: ${JSON.stringify(result)}`);
    }
  } catch (err) {
    fail('Scenario 2 (new email, valid area)', err.message);
  }

  // ─── Scenario 3: New email, invalid area → must throw "Invalid area ID" ──
  const anotherFreshEmail = `oauth-test-${Date.now() + 1}@example.com`;
  try {
    await authService.googleLogin({
      user: { email: anotherFreshEmail, name: 'Test User 2' },
      accessToken: 'fake-access-token-1234567890',
      area: '99999',
    });
    fail('Scenario 3 (new email, invalid area)', 'Expected BadRequestException but got success');
  } catch (err) {
    if (err.message === 'Invalid area ID') {
      ok('Scenario 3 (new email, invalid area)', `Threw: "${err.message}"`);
    } else {
      fail('Scenario 3 (new email, invalid area)', `Wrong error: "${err.message}"`);
    }
  }

  // ─── Scenario 4: Existing email → must succeed regardless of area ─────────
  try {
    // freshEmail was created in Scenario 2 — it exists now
    const result = await authService.googleLogin({
      user: { email: freshEmail, name: 'Test User' },
      accessToken: 'fake-access-token-1234567890',
      area: null, // no area — existing user should not need it
    });
    if (result && typeof result === 'string') {
      // Verify areaFK was not overwritten
      const dbUser = await usersService.findOneParams({ email: freshEmail });
      const areaIntact = dbUser.areaFK === 1;
      ok(
        'Scenario 4 (existing email, no area)',
        `token OK, areaFK=${dbUser.areaFK} (${areaIntact ? 'unchanged ✓' : 'CHANGED ✗'})`,
      );
      if (!areaIntact) failed++;
    } else {
      fail('Scenario 4 (existing email, no area)', `Unexpected result: ${JSON.stringify(result)}`);
    }
  } catch (err) {
    fail('Scenario 4 (existing email, no area)', err.message);
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);

  await app.close();
  process.exit(failed > 0 ? 1 : 0);
}

run();