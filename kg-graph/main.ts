import "./kg-graph.css";

/**
 * Knowledge Graph 2D 시각화
 * - graph-data.json 로드 후 force-graph로 렌더링
 * - 노드 클릭 시 해당 포스트로 이동
 * - 다크/라이트 모드 대응
 */

import { forceCollide } from "d3-force";
import ForceGraph from "force-graph";

const root = document.getElementById("kg-graph-root");
const baseUrl = (root?.dataset?.baseurl || "").replace(/\/$/, "");

if (!root) {
  console.error("[kg-graph] #kg-graph-root not found");
} else {
  fetch(`${baseUrl}/assets/data/graph-data.json`)
    .then((r) => r.json())
    .then((data) => {
      const graph = new ForceGraph(root)
        .graphData(data)
        .nodeLabel((n: { name?: string }) => n.name || "")
        .nodeAutoColorBy("group")
        .nodeVal((n: { val?: number }) => (n.val || 1) * 2)
        .linkColor(() => (document.documentElement.getAttribute("data-mode") === "dark" ? "#64748b" : "#94a3b8"))
        .onNodeClick((node: { id?: string }) => {
          if (node?.id) {
            window.location.href = baseUrl + node.id;
          }
        });

      // 링크 거리·충돌·반발력 조정: 뭉침 방지
      const linkForce = graph.d3Force("link" as "link");
      if (linkForce && typeof (linkForce as { distance?: (v: number) => unknown }).distance === "function") {
        (linkForce as { distance: (v: number) => unknown }).distance(50);
      }
      const chargeForce = graph.d3Force("charge" as "charge");
      if (chargeForce && typeof (chargeForce as { strength?: (v: number) => unknown }).strength === "function") {
        (chargeForce as { strength: (v: number) => unknown }).strength(-80);
      }
      graph.d3Force(
        "collide",
        forceCollide((node: { val?: number }) => 8 + (node.val || 1) * 2).iterations(3)
      );
      graph.d3ReheatSimulation();

      // ResizeObserver
      const ro = new ResizeObserver(() => graph.width(root.offsetWidth).height(root.offsetHeight));
      ro.observe(root);

      // 테마 변경 시 링크 색상 갱신
      const observer = new MutationObserver(() => {
        graph.linkColor(() =>
          document.documentElement.getAttribute("data-mode") === "dark" ? "#64748b" : "#94a3b8"
        );
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-mode"] });
    })
    .catch((e) => {
      root.innerHTML = `<p class="text-danger">그래프 데이터를 불러올 수 없습니다: ${e.message}</p>`;
    });
}
