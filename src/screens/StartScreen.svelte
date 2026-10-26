<script lang="ts">
  import MeshHero from '../components/MeshHero.svelte'
  import { hasStoredProject } from '../services/project-storage'
  import { downloadProjectJson } from '../services/project-export'
  import { store, startFresh, continueWork, importText, goTo } from '../state/project-state.svelte'

  let message = $state('')
  let input: HTMLInputElement | undefined = $state()
  const saved = hasStoredProject()
</script>

<section class="hero">
  <MeshHero />
  <div>
    <p class="eyebrow">색을 고르고, 비교하고, 계획으로 남기기</p>
    <h1>마이 브랜드 컬러 캔버스</h1>
    <p>브랜드에 어울리는 세 가지 색과 비율을 직접 정하고, 브랜드 컬러 계획서 초안까지 만들어 보세요.</p>
    <div class="actions">
      <button class="btn btn-primary" type="button" onclick={startFresh}>실습 시작하기</button>
      {#if saved}<button class="btn btn-secondary" type="button" onclick={continueWork}>이어서 하기</button>{/if}
    </div>
    <div class="actions">
      <button class="btn btn-ghost" type="button" onclick={() => input?.click()}>JSON 불러오기</button>
      {#if saved}<button class="btn btn-ghost" type="button" onclick={() => downloadProjectJson(store.project)}>작업 파일 내려받기</button>{/if}
    </div>
    {#if message}<p role="alert">{message}</p>{/if}
    <input bind:this={input} class="sr-only" type="file" accept="application/json,.json" onchange={async (e) => {
      const file = e.currentTarget.files?.[0]
      if (!file) return
      message = importText(await file.text()) ?? ''
      if (!message) goTo('brand')
      e.currentTarget.value = ''
    }} />
  </div>
</section>

<section class="guide" aria-labelledby="guide-heading">
  <div class="inner">
    <h2 id="guide-heading">브랜드 컬러 디자인 흐름</h2>
    <p class="caption">상징 색을 정하고, 배색을 익힌 뒤, 키워드와 팔레트, 점검, 계획서까지 이어집니다.</p>
    <img
      src="/brand-color-steps.png"
      alt="성공적인 창업을 위한 브랜드 컬러 디자인 5단계. 1-2단계에서는 상징 컬러와 목표를 정하고 컬러 기초와 배색을 익힙니다. 3-5단계에서는 핵심 키워드와 컬러를 정하고 무드보드로 점검한 뒤 실무용 가이드 문서로 저장합니다."
      width="1024"
      height="571"
    />
    <p class="caption caption-guide guide-foot">작업은 이 브라우저에만 자동 저장됩니다. 다른 기기에서는 JSON 작업 파일로 이어가세요.</p>
  </div>
</section>

<style>
  .hero { position: relative; min-height: 520px; display: grid; place-items: center; color: white; text-align: center; padding: 72px 20px; }
  .hero div { position: relative; max-width: 680px; }
  .eyebrow { margin-bottom: 12px; }
  h1 { margin-bottom: 16px; }
  .actions { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; margin-top: 16px; }
  .hero :global(.btn-secondary), .hero :global(.btn-ghost) { color: white; border-color: rgba(255,255,255,.4); background: transparent; }
  .guide { background: var(--step-shell-bg, #f5f6f9); padding: 64px 20px 96px; }
  .guide img { display: block; width: min(100%, 960px); height: auto; margin: 24px auto 0; border-radius: 16px; }
  .inner { width: min(100%, var(--content)); margin: 0 auto; }
  h2, .caption { text-align: center; }
  .guide-foot { margin: 28px auto 0; max-width: 36rem; }
</style>
