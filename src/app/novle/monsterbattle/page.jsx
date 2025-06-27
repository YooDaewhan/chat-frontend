import { Suspense } from "react";
import MonsterBattlePage from "@/components/MonsterBattlePage";

export default function Page() {
  return (
    <Suspense fallback={<div>로딩중...</div>}>
      <MonsterBattlePage />
    </Suspense>
  );
}
