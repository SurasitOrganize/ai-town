import * as Phaser from 'phaser';
import { useStore } from '@/lib/store';
import {
  TILE,
  playerSpawn,
  targetTile,
  tileToWorld,
  variantIndex,
} from '@/lib/game/officeLayout';

const DIRS = ['down', 'left', 'right', 'up'] as const;
type Dir = (typeof DIRS)[number];

const STATUS_COLOR: Record<string, number> = {
  online: 0x22c55e,
  busy: 0xeab308,
  offline: 0x6b7280,
};

export class OfficeScene extends Phaser.Scene {
  private player?: Phaser.Physics.Arcade.Sprite;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private agents = new Map<string, Phaser.Physics.Arcade.Sprite>();
  private blockers?: Phaser.Physics.Arcade.StaticGroup;
  private interactionText?: Phaser.GameObjects.Text;
  private nearbyAgent: string | null = null;
  private unsubscribeAgents?: () => void;
  private facing: Dir = 'down';

  constructor() {
    super({ key: 'OfficeScene' });
  }

  preload() {
    this.load.spritesheet('office-tiles', '/assets/office-tiles.png', {
      frameWidth: TILE,
      frameHeight: TILE,
    });
    this.load.spritesheet('characters', '/assets/characters.png', {
      frameWidth: TILE,
      frameHeight: TILE,
    });
    this.load.tilemapTiledJSON('office', '/assets/office-map.json');
  }

  create() {
    this.createAnimations();

    const map = this.make.tilemap({ key: 'office' });
    const tiles = map.addTilesetImage('office', 'office-tiles');
    if (!tiles) return;

    const floor = map.createLayer('Floor', tiles, 0, 0);
    const walls = map.createLayer('Walls', tiles, 0, 0);
    const furniture = map.createLayer('Furniture', tiles, 0, 0);
    floor?.setDepth(0);

    this.blockers = this.physics.add.staticGroup();
    if (walls) this.spawnLayer(walls, (gid) => gid !== 7 && gid !== 8);
    if (furniture) this.spawnLayer(furniture, (gid) => gid !== 12);

    const spawn = tileToWorld(playerSpawn);
    this.player = this.physics.add.sprite(spawn.x, spawn.y, 'characters', 0);
    this.prepareActor(this.player);
    this.player.setCollideWorldBounds(true);
    this.playLoop(this.player, 0, 'down', false);

    this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    this.physics.add.collider(this.player, this.blockers);

    this.syncAgents();
    this.unsubscribeAgents = useStore.subscribe((state, prev) => {
      if (state.agents !== prev.agents) this.syncAgents();
    });
    this.events.once('shutdown', () => {
      this.unsubscribeAgents?.();
      this.unsubscribeAgents = undefined;
    });

    const camera = this.cameras.main;
    camera.setZoom(2);
    camera.setRoundPixels(true);
    camera.startFollow(this.player, true, 0.12, 0.12);
    camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

    this.cursors = this.input.keyboard?.createCursorKeys();
    this.interactionText = this.add.text(16, 16, '', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#ffffff',
      backgroundColor: '#111111',
      padding: { x: 4, y: 2 },
    });
    this.interactionText.setScrollFactor(0);
    this.interactionText.setDepth(10000);
    this.interactionText.setVisible(false);

    this.input.keyboard?.on('keydown-E', () => {
      if (this.nearbyAgent) this.openChat(this.nearbyAgent);
    });
  }

  createAnimations() {
    for (let variant = 0; variant < 6; variant += 1) {
      DIRS.forEach((dir, dirIndex) => {
        const base = variant * 12 + dirIndex * 3;
        this.anims.create({
          key: `char-${variant}-${dir}-idle`,
          frames: [{ key: 'characters', frame: base }],
          frameRate: 1,
        });
        this.anims.create({
          key: `char-${variant}-${dir}-walk`,
          frames: [
            { key: 'characters', frame: base + 1 },
            { key: 'characters', frame: base + 2 },
          ],
          frameRate: 6,
          repeat: -1,
        });
      });
    }
  }

  spawnLayer(layer: Phaser.Tilemaps.TilemapLayer, solid: (gid: number) => boolean) {
    layer.forEachTile((tile) => {
      if (tile.index <= 0) return;
      const x = tile.getCenterX();
      const y = tile.getCenterY();
      const frame = tile.index - 1;
      if (solid(tile.index)) {
        const body = this.blockers!.create(x, y, 'office-tiles', frame) as Phaser.Physics.Arcade.Sprite;
        body.setDepth(y + TILE / 2);
        body.refreshBody();
      } else {
        const sprite = this.add.sprite(x, y, 'office-tiles', frame);
        sprite.setDepth(y + TILE / 2);
      }
    });
    layer.setVisible(false);
  }

  prepareActor(sprite: Phaser.Physics.Arcade.Sprite) {
    sprite.setOrigin(0.5, 0.85);
    sprite.setSize(8, 6);
    sprite.setOffset(4, 8);
  }

  playLoop(sprite: Phaser.Physics.Arcade.Sprite, variant: number, dir: Dir, moving: boolean) {
    const key = `char-${variant}-${dir}-${moving ? 'walk' : 'idle'}`;
    if (sprite.anims.currentAnim?.key !== key) sprite.play(key);
  }

  directionOf(vx: number, vy: number, fallback: Dir): Dir {
    if (Math.abs(vx) < 1 && Math.abs(vy) < 1) return fallback;
    if (Math.abs(vx) > Math.abs(vy)) return vx < 0 ? 'left' : 'right';
    return vy < 0 ? 'up' : 'down';
  }

  attachLabel(sprite: Phaser.Physics.Arcade.Sprite, name: string, status: string) {
    const label = this.add.text(0, 0, name, {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#ffffff',
      stroke: '#1a1a1a',
      strokeThickness: 2,
    }).setOrigin(0.5, 1);
    const dot = this.add.circle(0, 0, 2, STATUS_COLOR[status] ?? STATUS_COLOR.offline);
    const bubble = this.add.text(0, 0, '...', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#222222',
      backgroundColor: '#ffffff',
      padding: { x: 2, y: 0 },
    }).setOrigin(0.5, 1).setVisible(status === 'busy');
    sprite.setData('label', label);
    sprite.setData('dot', dot);
    sprite.setData('bubble', bubble);
  }

  placeLabel(sprite: Phaser.Physics.Arcade.Sprite) {
    const label = sprite.getData('label') as Phaser.GameObjects.Text | undefined;
    const dot = sprite.getData('dot') as Phaser.GameObjects.Arc | undefined;
    const bubble = sprite.getData('bubble') as Phaser.GameObjects.Text | undefined;
    if (!label || !dot || !bubble) return;
    const depth = sprite.y;
    sprite.setDepth(depth);
    label.setPosition(sprite.x, sprite.y - 15);
    label.setDepth(depth + 2);
    dot.setPosition(sprite.x - label.width / 2 - 4, sprite.y - 18);
    dot.setDepth(depth + 2);
    bubble.setPosition(sprite.x, sprite.y - 24);
    bubble.setDepth(depth + 3);
  }

  syncAgents() {
    const agents = useStore.getState().agents;
    const seen = new Set<string>();

    agents.forEach((agent, index) => {
      seen.add(agent.id);
      const tile = targetTile(agent, index);
      const world = tileToWorld(tile);
      const variant = variantIndex(agent.avatar, index);
      let sprite = this.agents.get(agent.id);
      if (!sprite) {
        sprite = this.physics.add.sprite(world.x, world.y, 'characters', variant * 12);
        this.prepareActor(sprite);
        this.attachLabel(sprite, agent.name, agent.status);
        this.agents.set(agent.id, sprite);
        this.physics.add.collider(sprite, this.blockers!);
      }
      sprite.setData('agentId', agent.id);
      sprite.setData('agentName', agent.name);
      sprite.setData('status', agent.status);
      sprite.setData('variant', variant);
      sprite.setData('targetX', world.x);
      sprite.setData('targetY', world.y);
      const label = sprite.getData('label') as Phaser.GameObjects.Text;
      label.setText(agent.name);
      const dot = sprite.getData('dot') as Phaser.GameObjects.Arc;
      dot.setFillStyle(STATUS_COLOR[agent.status] ?? STATUS_COLOR.offline);
      const bubble = sprite.getData('bubble') as Phaser.GameObjects.Text;
      bubble.setVisible(agent.status === 'busy');
    });

    this.agents.forEach((sprite, id) => {
      if (seen.has(id)) return;
      (sprite.getData('label') as Phaser.GameObjects.Text | undefined)?.destroy();
      (sprite.getData('dot') as Phaser.GameObjects.Arc | undefined)?.destroy();
      (sprite.getData('bubble') as Phaser.GameObjects.Text | undefined)?.destroy();
      sprite.destroy();
      this.agents.delete(id);
    });
  }

  update() {
    if (!this.player || !this.cursors) return;

    const speed = 56;
    this.player.setVelocity(0);
    if (this.cursors.left.isDown) this.player.setVelocityX(-speed);
    else if (this.cursors.right.isDown) this.player.setVelocityX(speed);
    if (this.cursors.up.isDown) this.player.setVelocityY(-speed);
    else if (this.cursors.down.isDown) this.player.setVelocityY(speed);

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (body.velocity.x !== 0 && body.velocity.y !== 0) {
      this.player.setVelocity(body.velocity.x * 0.707, body.velocity.y * 0.707);
    }
    this.facing = this.directionOf(body.velocity.x, body.velocity.y, this.facing);
    this.playLoop(this.player, 0, this.facing, body.velocity.length() > 1);
    this.player.setDepth(this.player.y);

    this.agents.forEach((sprite) => this.moveAgent(sprite));
    this.checkAgentProximity();
  }

  moveAgent(sprite: Phaser.Physics.Arcade.Sprite) {
    const targetX = sprite.getData('targetX') as number;
    const targetY = sprite.getData('targetY') as number;
    const variant = sprite.getData('variant') as number;
    const distance = Phaser.Math.Distance.Between(sprite.x, sprite.y, targetX, targetY);
    let dir = (sprite.getData('dir') as Dir) || 'down';
    if (distance > 2) {
      const angle = Phaser.Math.Angle.Between(sprite.x, sprite.y, targetX, targetY);
      const speed = 36;
      sprite.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      dir = this.directionOf(Math.cos(angle), Math.sin(angle), dir);
      this.playLoop(sprite, variant, dir, true);
    } else {
      sprite.setVelocity(0);
      sprite.setPosition(targetX, targetY);
      this.playLoop(sprite, variant, dir, false);
    }
    sprite.setData('dir', dir);
    this.placeLabel(sprite);
  }

  checkAgentProximity() {
    if (!this.player || !this.interactionText) return;
    let nearest: string | null = null;
    let nearestDistance = 28;
    this.agents.forEach((sprite) => {
      const distance = Phaser.Math.Distance.Between(this.player!.x, this.player!.y, sprite.x, sprite.y);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = sprite.getData('agentId');
      }
    });
    if (nearest) {
      this.nearbyAgent = nearest;
      const name = this.agents.get(nearest)?.getData('agentName') || 'Agent';
      this.interactionText.setText(`Press E to chat with ${name}`);
      this.interactionText.setVisible(true);
    } else {
      this.nearbyAgent = null;
      this.interactionText.setVisible(false);
    }
  }

  openChat(agentId: string) {
    const storeState = useStore.getState();
    const agent = storeState.agents.find((item) => item.id === agentId);
    if (agent) {
      storeState.selectAgent(agent);
      storeState.toggleChat(true);
    }
  }
}
