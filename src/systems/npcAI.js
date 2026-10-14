import { Vector3, Matrix } from 'babylonjs';
import { canMoveToR } from '../world/grid.js';
import { getPlayerState } from '../entities/player.js';
import { getBuildings } from '../world/generator.js';
import { CFG } from '../config.js';
import { getTerrainHeight } from '../world/terrain.js';
import { collidesWithRock, getRockPushback } from '../world/vegetation.js';
import { collidesWithDoorPanel, getDoorPanelPushback } from '../world/doors.js';
import { getCamera, getScene, getEngine } from '../core/scene.js';
import { hasLineOfSight } from '../core/physics.js';

const npcs = [];
const NPC_RADIUS = 0.5;
const TALK_DIST = 3.5;

const SOLDIER_LINES = [
  "조용한 하루군... 아직은.",
  "밖에서는 경계를 늦추지 마.",
  "이 벽이 영원히 버티지는 못해.",
  "안개 속에서 뭔가를 봤어...",
  "물가에서는 발밑을 조심해.",
  "또 하루, 또 순찰이군.",
  "더 험한 일을 겪어본 얼굴이군.",
  "요즘 여우들이 이상하게 행동해.",
  "무기는 가까이 두는 게 좋아.",
  "그림자가 혼자 움직이는 걸 본 적 있어.",
  "밤에는 너무 멀리 가지 마.",
  "귀 기울이면 돌이 속삭여.",
  "누가 또 문을 열어뒀군.",
  "지금은 따뜻한 불이 그립네.",
  "안개 너머에 뭐가 있을지 궁금하지 않아?",
  "발이 너무 아프군.",
  "분명 저 돌이 움직였어.",
  "누군가가 떠오르네... 아니, 됐어.",
  "순찰할 때마다 동전을 받았다면...",
  "어둠의 실이 퍼지고 있어.",
  "여기 땅은 느낌이 이상해.",
  "이 돌 밑에 무언가가 있어.",
  "어젯밤 노래를 들었어. 아무도 없었는데.",
  "옛 감시탑은 오래전에 무너졌지.",
  "여기가 한때 왕국이었다더군.",
  "저녁마다 안개가 더 짙어져.",
  "벽에서 이상한 표시를 발견했어.",
  "까마귀가 더는 오지 않아.",
  "바람이 잦아들면 무언가 꿈틀거려.",
  "강물은 맑았어. 이제는 아니지만.",
  "이 고요함을 믿지 않아.",
  "나무가 어제보다 가까워졌어.",
  "어젯밤 별이 하나도 없었어.",
  "공기에서 웅웅거리는 소리가 나. 들려?",
  "옛 우물이 하룻밤 새 말랐어.",
  "내 것이 아닌 발자국이 자꾸 보여.",
  "벽의 이끼가 너무 빨리 자라.",
  "북쪽 벽 근처는 언제나 차가워.",
  "가끔 그림자와 빛이 맞지 않아.",
  "이곳은 기억을 갖고 있어.",
  "교대까지 한 시간이나 남았군.",
  "대장이 아직 돌아오지 않았어.",
  "동쪽 전초기지와 연락이 끊겼어.",
  "보급품이 떨어져 가.",
  "새벽부터 경계 근무 중이야.",
  "주변은 이상 없어. 지금은.",
  "남쪽 벽을 보강해야 해.",
  "며칠째 제대로 못 잤어.",
  "오늘 순찰만 세 번이야. 다리가 버티질 못해.",
  "여기 신병들은 오래 버티지 못해.",
  "옛 주둔지가 그립네. 침대가 제대로 있었지.",
  "명령은 명령이니까.",
  "누가 저 문을 고쳐야 해.",
  "무기고를 다시 채워야겠어.",
  "이 벽의 돌을 전부 세어봤어.",
  "먹을 것 있나? 배고파 죽겠어.",
  "나도 한때는 모험가였지.",
  "여우들이 우리를 평가할까?",
  "저 돌에 이름을 지어줬어. 제럴드야.",
  "오래 가만히 있으면 조각상이 될까?",
  "내 장화는 가죽보다 구멍이 많아.",
  "여우에게 말을 걸어봤는데 잘 안 됐어.",
  "이 계단 만든 사람은 제정신이 아니었어.",
  "말들은 편하게 지내겠지.",
  "근무 바꿀래? 그럴 줄 알았어.",
  "적어도 풍경은... 안개가 많군.",
  "말 그대로 제자리에서 빙빙 돌고 있어.",
  "여기 음식 맛은 벽 생김새와 닮았어.",
  "어젯밤 치즈 꿈을 꿨어.",
  "원래 이렇게 추워? 나만 그런가?",
  "내 칼이 내 대화보다 더 무뎌.",
  "따뜻한 침대가 어떤 느낌인지 잊었어.",
  "이 일을 하기엔 급여가 너무 적어.",
  "여우가 내 점심을 훔친 것 같아.",
  "지금 맥주 한 잔이면 정말 좋겠네.",
  "우리가 왜 여기 있는지 생각해본 적 있어?",
  "어떤 문은 닫아두는 게 나아.",
  "우린 결국 이야기로 남겠지.",
  "어둠의 실이 오기 전 세상은 달랐어.",
  "용기가 뭔지 알던 때가 있었지.",
  "희망은 참 이상한 짐이야.",
  "잘못 든 길도 어딘가로 이어지지.",
  "기억하는 것보다 잊은 것이 더 많아.",
  "과거는 기억이 담긴 안개일 뿐이야.",
  "벽을 세워도 영원히 막을 수는 없어.",
  "하류의 물은 마시지 마.",
  "어두워지면 횃불 근처에 있어.",
  "무언가 움직이면 따라가지 마.",
  "지붕은 보기보다 튼튼하지 않아.",
  "숲 가장자리를 봐. 언제나.",
  "직감을 믿어. 목숨을 지켜줄 거야.",
  "열린 문에 등을 보이지 마.",
  "높은 곳은 네 편이야.",
  "계속 움직여. 가만히 있으면 위험이 찾아와.",
  "안개가 짙어지면 빨리 피할 곳을 찾아."
];

let speechTimer = 0;
let speechTarget = null;

export function getNpcs() { return npcs; }

/**
 * Check if player collides with any NPC. Returns push-back vector or null.
 */
export function getNpcCollision(px, pz, playerRadius) {
  for (const npc of npcs) {
    const pos = npc.model.position;
    const dx = px - pos.x;
    const dz = pz - pos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    const minDist = playerRadius + NPC_RADIUS;
    if (dist < minDist && dist > 0) {
      return { x: (dx / dist) * (minDist - dist), z: (dz / dist) * (minDist - dist) };
    }
  }
  return null;
}

/**
 * Register a soldier NPC with wandering behavior.
 * In Babylon.js, clips are AnimationGroups (not Three.js AnimationClips).
 */
export function registerSoldier(model, mixer, clips) {
  const idleAction = mixer.clipAction(clips.idle);
  const walkAction = mixer.clipAction(clips.walk);

  if (walkAction) walkAction.timeScale = 0.9;
  idleAction.play();

  npcs.push({
    type: 'soldier',
    model,
    mixer,
    idleAction,
    walkAction,
    runAction: null,
    state: 'idle',
    timer: 1 + Math.random() * 3,
    fleeTimer: 0,
    dirX: 0,
    dirZ: 0,
    speed: 2.0,
    radius: NPC_RADIUS,
    fleeRange: 0,
    fleeSpeed: 0,
    facingOffset: Math.PI,
  });
}

/**
 * Register a fox NPC that flees from the player.
 */
export function registerFox(model, mixer, clips) {
  const idleAction = mixer.clipAction(clips.idle);
  const walkAction = mixer.clipAction(clips.walk);
  const runAction = clips.run ? mixer.clipAction(clips.run) : walkAction;

  idleAction.play();

  npcs.push({
    type: 'fox',
    model,
    mixer,
    idleAction,
    walkAction,
    runAction,
    state: 'idle',
    timer: 1 + Math.random() * 3,
    fleeTimer: 0,
    dirX: 0,
    dirZ: 0,
    speed: 2.5,
    radius: NPC_RADIUS,
    fleeRange: 15,
    fleeSpeed: 5.0,
    facingOffset: 0,
    stuckTimer: 0,
    lastFleeX: 0,
    lastFleeZ: 0,
  });
}

function pickDirection(npc) {
  const angle = Math.random() * Math.PI * 2;
  npc.dirX = Math.sin(angle);
  npc.dirZ = Math.cos(angle);
}

function crossfade(from, to, duration = 0.3) {
  if (from === to) return;
  to.reset().setEffectiveWeight(1).fadeIn(duration).play();
  from.fadeOut(duration);
}

function distToPlayer(npc) {
  const p = getPlayerState();
  const pos = npc.model.position;
  const dx = pos.x - p.x;
  const dz = pos.z - p.z;
  return Math.sqrt(dx * dx + dz * dz);
}

/**
 * Check if a position is inside any building.
 */
function isInsideBuilding(x, z) {
  const buildings = getBuildings();
  for (const b of buildings) {
    const bx1 = b.x * 2 - 80 + 1;
    const bz1 = b.z * 2 - 80 + 1;
    const bx2 = (b.x + b.w) * 2 - 80 - 1;
    const bz2 = (b.z + b.h) * 2 - 80 - 1;
    if (x > bx1 && x < bx2 && z > bz1 && z < bz2) return true;
  }
  return false;
}

function smartFleeDirection(npc) {
  const p = getPlayerState();
  const pos = npc.model.position;
  const dx = pos.x - p.x;
  const dz = pos.z - p.z;
  const awayAngle = Math.atan2(dx, dz);
  const inBuilding = isInsideBuilding(pos.x, pos.z);

  let bestAngle = awayAngle;
  let bestScore = -Infinity;

  const steps = [2.0, 1.0, 0.5];

  for (const step of steps) {
    for (let i = 0; i < 12; i++) {
      const angle = awayAngle + ((i * Math.PI * 2) / 12);
      const testX = pos.x + Math.sin(angle) * step;
      const testZ = pos.z + Math.cos(angle) * step;

      if (!canNpcMove(testX, testZ, npc.radius)) continue;

      const newDx = testX - p.x;
      const newDz = testZ - p.z;
      let score = Math.sqrt(newDx * newDx + newDz * newDz);

      if (inBuilding && !isInsideBuilding(testX, testZ)) {
        score += 20;
      }

      const angleDiff = Math.abs(angle - awayAngle);
      score -= angleDiff * 0.5;
      score += step * 0.5;

      if (score > bestScore) {
        bestScore = score;
        bestAngle = angle;
      }
    }
    if (bestScore > -Infinity) break;
  }

  npc.dirX = Math.sin(bestAngle);
  npc.dirZ = Math.cos(bestAngle);
}

function canNpcMove(x, z, r) {
  if (!canMoveToR(x, z, r) || collidesWithRock(x, z, r) || collidesWithDoorPanel(x, z, r)) return false;
  if (!CFG.SNOW_MODE && getTerrainHeight(x, z) < CFG.WATER_Y) return false;
  return true;
}

function moveNpc(npc, mx, mz) {
  const pos = npc.model.position;
  const r = npc.radius;
  if (canNpcMove(pos.x + mx, pos.z, r)) pos.x += mx;
  if (canNpcMove(pos.x, pos.z + mz, r)) pos.z += mz;
}

export function updateNpcs(dt) {
  for (const npc of npcs) {
    const pos = npc.model.position;

    // Follow terrain height
    pos.y = getTerrainHeight(pos.x, pos.z);
    if (CFG.SNOW_MODE) pos.y = Math.max(pos.y, CFG.WATER_Y);

    // Pushback from rocks and doors
    const rockPush = getRockPushback(pos.x, pos.z, npc.radius);
    if (rockPush) {
      pos.x += rockPush.x;
      pos.z += rockPush.z;
    }
    const doorPush = getDoorPanelPushback(pos.x, pos.z, npc.radius);
    if (doorPush) {
      pos.x += doorPush.x;
      pos.z += doorPush.z;
    }

    // Flee behavior (foxes)
    if (npc.fleeRange > 0) {
      const dist = distToPlayer(npc);

      if (dist < npc.fleeRange) {
        if (npc.state !== 'fleeing') {
          const prev = npc.state === 'walking' ? npc.walkAction : npc.idleAction;
          crossfade(prev, npc.runAction);
          npc.state = 'fleeing';
          npc.fleeTimer = 0;
        }

        npc.fleeTimer -= dt;
        const mx = npc.dirX * npc.fleeSpeed * dt;
        const mz = npc.dirZ * npc.fleeSpeed * dt;
        const blocked = !canNpcMove(pos.x + mx, pos.z + mz, npc.radius);

        if (npc.fleeTimer <= 0 || blocked) {
          smartFleeDirection(npc);
          npc.fleeTimer = 0.4;
        }

        moveNpc(npc, npc.dirX * npc.fleeSpeed * dt, npc.dirZ * npc.fleeSpeed * dt);
        // Babylon.js rotation: set Y rotation directly
        npc.model.rotation = new Vector3(0, Math.atan2(npc.dirX, npc.dirZ) + npc.facingOffset, 0);

        // Stuck detection
        if (npc.stuckTimer !== undefined) {
          const movedDx = pos.x - npc.lastFleeX;
          const movedDz = pos.z - npc.lastFleeZ;
          const movedDist = Math.sqrt(movedDx * movedDx + movedDz * movedDz);
          if (movedDist < 0.1) {
            npc.stuckTimer += dt;
          } else {
            npc.stuckTimer = 0;
            npc.lastFleeX = pos.x;
            npc.lastFleeZ = pos.z;
          }
          if (npc.stuckTimer > 3.0 && isInsideBuilding(pos.x, pos.z)) {
            for (let r = 2; r <= 20; r += 2) {
              let found = false;
              for (let a = 0; a < 8; a++) {
                const angle = a * Math.PI / 4;
                const tx = pos.x + Math.cos(angle) * r;
                const tz = pos.z + Math.sin(angle) * r;
                if (canNpcMove(tx, tz, npc.radius) && !isInsideBuilding(tx, tz)) {
                  pos.x = tx;
                  pos.z = tz;
                  npc.stuckTimer = 0;
                  found = true;
                  break;
                }
              }
              if (found) break;
            }
          }
        }

        npc.timer = 1 + Math.random() * 2;
        continue;
      } else if (npc.state === 'fleeing') {
        npc.state = 'idle';
        npc.timer = 1 + Math.random() * 2;
        crossfade(npc.runAction, npc.idleAction);
      }
    }

    // Normal wander behavior
    npc.timer -= dt;

    if (npc.timer <= 0) {
      if (npc.state === 'idle') {
        npc.state = 'walking';
        npc.timer = 2 + Math.random() * 4;
        pickDirection(npc);
        crossfade(npc.idleAction, npc.walkAction);
      } else {
        npc.state = 'idle';
        npc.timer = 1 + Math.random() * 3;
        crossfade(npc.walkAction, npc.idleAction);
      }
    }

    if (npc.state === 'walking') {
      const mx = npc.dirX * npc.speed * dt;
      const mz = npc.dirZ * npc.speed * dt;

      let moved = false;
      if (canNpcMove(pos.x + mx, pos.z + mz, npc.radius)) {
        pos.x += mx;
        pos.z += mz;
        moved = true;
      } else if (canNpcMove(pos.x + mx, pos.z, npc.radius)) {
        pos.x += mx;
        moved = true;
      } else if (canNpcMove(pos.x, pos.z + mz, npc.radius)) {
        pos.z += mz;
        moved = true;
      }

      if (!moved) {
        npc.state = 'idle';
        npc.timer = 0.5 + Math.random() * 1.0;
        crossfade(npc.walkAction, npc.idleAction);
      } else {
        npc.model.rotation = new Vector3(0, Math.atan2(npc.dirX, npc.dirZ) + npc.facingOffset, 0);
      }
    }
  }

  // Update speech bubble timer
  if (speechTimer > 0) {
    speechTimer -= dt;
    if (speechTimer <= 0) {
      speechTarget = null;
      const el = document.getElementById('npc-speech');
      if (el) el.style.display = 'none';
    }
  }
}

/**
 * Get the nearest soldier NPC within talk range, or null.
 */
export function getNearestSoldier() {
  const p = getPlayerState();
  const cam = getCamera();
  if (!cam) return null;

  let best = null;
  let bestDot = -Infinity;

  const eyePos = { x: p.x, y: p.y + CFG.PLAYER_H * 0.8, z: p.z };
  const viewDir = cam.getForwardRay(1).direction;

  for (const npc of npcs) {
    if (npc.type !== 'soldier') continue;
    
    const pos = npc.model.position;
    const dx = p.x - pos.x;
    const dz = p.z - pos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);
    
    if (dist > TALK_DIST) continue;

    const npcTargetPos = new Vector3(pos.x, pos.y + 1.0, pos.z);
    const toTarget = npcTargetPos.subtract(new Vector3(eyePos.x, eyePos.y, eyePos.z)).normalize();
    const dot = Vector3.Dot(viewDir, toTarget);

    if (dot > 0.4 && dot > bestDot) {
      if (!hasLineOfSight(eyePos, npcTargetPos)) continue;
      bestDot = dot;
      best = npc;
    }
  }
  return best;
}

/**
 * Talk to nearest soldier — shows a random speech line.
 */
export function talkToNearestSoldier() {
  const npc = getNearestSoldier();
  if (!npc) return false;

  const line = SOLDIER_LINES[Math.floor(Math.random() * SOLDIER_LINES.length)];
  speechTarget = npc;
  speechTimer = 3.5;

  const el = document.getElementById('npc-speech');
  if (el) {
    el.textContent = line;
    el.style.display = 'block';
  }
  return true;
}

/**
 * Project a world position to screen coords (Babylon.js).
 * Returns { x, y, behind } where behind=true if behind camera.
 */
function projectToScreen(wx, wy, wz) {
  const engine = getEngine();
  const scene = getScene();
  const camera = getCamera();
  const vp = camera.viewport.toGlobal(engine.getRenderWidth(), engine.getRenderHeight());
  const projected = Vector3.Project(
    new Vector3(wx, wy, wz),
    Matrix.Identity(),
    scene.getTransformMatrix(),
    vp
  );
  return { x: projected.x, y: projected.y, behind: projected.z > 1 };
}

/**
 * Update the soldier [E] hint and speech bubble screen positions.
 */
export function updateSoldierHint() {
  const camera = getCamera();

  // Speech bubble follows the speaking soldier
  if (speechTarget && speechTimer > 0) {
    const pos = speechTarget.model.position;
    const p = projectToScreen(pos.x, pos.y + 1.8, pos.z);

    const el = document.getElementById('npc-speech');
    if (el && !p.behind) {
      const margin = 80;
      const bx = Math.max(margin, Math.min(window.innerWidth - margin, p.x));
      const by = Math.max(margin, Math.min(window.innerHeight - margin, p.y));
      el.style.left = bx + 'px';
      el.style.top = by + 'px';
    }
  }

  // [E] Talk hint
  const hintEl = document.getElementById('interact-hint');
  if (!hintEl) return;

  if (hintEl.style.display === 'block' && hintEl.dataset.source === 'door') return;

  const soldier = getNearestSoldier();
  if (!soldier) {
    if (hintEl.dataset.source === 'soldier') {
      hintEl.style.display = 'none';
      hintEl.dataset.source = '';
    }
    return;
  }

  // Soldier hint positioning is handled by updateInteractHint() in main.js
}
