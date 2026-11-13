import { MODEL_CATALOG } from '@/lib/model-catalog';
import { loadModelList } from '@/lib/pricing';

/**
 * 数字条（2026-11-13 第七版，只挂 /preview/home）
 *
 * 参考站在价格段上面有一条「1.97T+ / >99% / 99.98% / 小时级」，
 * 作用是把「我们有多大」一次说完，比一段形容词有说服力，也比一排卡片省地方。
 *
 * 我们只放站得住的三个数：模型数、厂商数、协议数——全部从真实目录算出来，
 * 不手写、不凑数。凑第四个（比如「类任务」）反而是自曝短板。
 */
export async function StatsBar() {
  const { models } = await loadModelList(MODEL_CATALOG);
  const vendorCount = new Set(models.map((model) => model.vendorName)).size;

  const stats = [
    { value: models.length, label: '个模型在架' },
    { value: vendorCount, label: '家上游厂商' },
    { value: 3, label: '种协议兼容' },
  ];

  return (
    <section className="bg-white py-14">
      <div className="pv-wrap">
        <dl className="pv-statline">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dd>
                <b>{stat.value}</b>
              </dd>
              <dt>
                <span>{stat.label}</span>
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
