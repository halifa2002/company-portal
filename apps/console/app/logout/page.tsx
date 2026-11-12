'use client';

import { useEffect, useState } from 'react';
import { authApi } from '@portal/api-client';
import { AuthShell } from '../../components/auth-shell';
import { Button } from '@portal/ui';

/**
 * 退出登录落点。
 *
 * 为什么单独一页：官网是静态站，跨源请求控制台会被浏览器的跨域策略挡掉，
 * 而退出必须真的调一次后端（refresh cookie 的 Path 是 /api/user/auth，
 * 只有落在同一站点下的请求才会被浏览器带上，后端才有机会清 cookie）。
 * 所以官网那颗「退出」只负责把人送到这里，由控制台自己完成退出再送登录页。
 *
 * 顺序上先等接口回来再跳：反过来的话，登录页一看 cookie 还在会立刻把人送回来，
 * 用户看到的就是「点了退出，结果又回到原来那页」。
 */
export default function LogoutPage() {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (failed) return;
    let alive = true;

    void (async () => {
      try {
        await authApi.logout();
        if (!alive) return;
        // replace 而不是 assign：退出后不该还能按后退回到控制台
        window.location.replace('/login');
      } catch {
        if (alive) setFailed(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, [failed]);

  return (
    <AuthShell
      title={failed ? '没退成功' : '正在退出'}
      description={failed ? '网络好像不太稳，再试一次就行' : '正在结束这次登录，稍等一下'}
    >
      <div className="flex flex-col items-center gap-4 py-2">
        {failed ? (
          <Button onClick={() => setFailed(false)} className="w-full">
            再试一次
          </Button>
        ) : (
          <span
            aria-hidden
            className="h-6 w-6 animate-spin rounded-full border-2 border-line border-t-brand"
          />
        )}
      </div>
    </AuthShell>
  );
}
