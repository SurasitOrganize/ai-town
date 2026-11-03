import * as Phaser from 'phaser';
import { useStore } from '@/lib/store';

export class OfficeScene extends Phaser.Scene {
  private player?: Phaser.Physics.Arcade.Sprite;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private agents: Map<string, Phaser.Physics.Arcade.Sprite> = new Map();
  private walls?: Phaser.Physics.Arcade.StaticGroup;
  private furniture?: Phaser.Physics.Arcade.StaticGroup;
  private interactionText?: Phaser.GameObjects.Text;
  private nearbyAgent: string | null = null;

  constructor() {
    super({ key: 'OfficeScene' });
  }

  preload() {
    // Load the tilemap
    this.load.tilemapTiledJSON('office', '/assets/office-map.json');
  }

  createPlaceholderTiles() {
    // Create placeholder graphics
    const graphics = this.add.graphics();
    
    // Floor tile (light gray) - single tile
    graphics.fillStyle(0xe0e0e0, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('floor', 32, 32);
    graphics.clear();
    
    // Wall tile (dark gray) - single tile
    graphics.fillStyle(0x4a4a4a, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.lineStyle(2, 0x2a2a2a, 1);
    graphics.strokeRect(0, 0, 32, 32);
    graphics.generateTexture('wall', 32, 32);
    graphics.clear();
    
    // Furniture tileset - 5 tiles in a horizontal strip (160x32)
    // Tile 0: Desk (brown)
    graphics.fillStyle(0x8b4513, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.lineStyle(2, 0x654321, 1);
    graphics.strokeRect(0, 0, 32, 32);
    
    // Tile 1: Chair (blue)
    graphics.fillStyle(0x4169e1, 1);
    graphics.fillRect(32 + 4, 4, 24, 24);
    
    // Tile 2: Plant (green)
    graphics.fillStyle(0x228b22, 1);
    graphics.fillCircle(64 + 16, 16, 12);
    
    // Tile 3: Meeting table (darker brown)
    graphics.fillStyle(0x654321, 1);
    graphics.fillRect(96, 0, 32, 32);
    
    // Tile 4: Sofa (red)
    graphics.fillStyle(0xdc143c, 1);
    graphics.fillRect(128, 0, 32, 32);
    
    graphics.generateTexture('furniture', 160, 32);
    graphics.clear();
    
    // Create player sprite (blue circle)
    graphics.fillStyle(0x00aaff, 1);
    graphics.fillCircle(16, 16, 12);
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeCircle(16, 16, 12);
    graphics.generateTexture('player', 32, 32);
    graphics.clear();
    
    // Create agent sprite (orange circle)
    graphics.fillStyle(0xff6600, 1);
    graphics.fillCircle(16, 16, 12);
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeCircle(16, 16, 12);
    graphics.generateTexture('agent', 32, 32);
    
    graphics.destroy();
  }

  create() {
    // Create placeholder tiles first
    this.createPlaceholderTiles();
    
    // Create the tilemap
    const map = this.make.tilemap({ key: 'office' });
    
    // Add tilesets
    const floorTileset = map.addTilesetImage('floor', 'floor');
    const wallTileset = map.addTilesetImage('wall', 'wall');
    const furnitureTileset = map.addTilesetImage('furniture', 'furniture');
    
    // Create layers
    const floorLayer = map.createLayer('Floor', floorTileset!, 0, 0);
    const wallLayer = map.createLayer('Walls', wallTileset!, 0, 0);
    const furnitureLayer = map.createLayer('Furniture', furnitureTileset!, 0, 0);
    
    // Set collision for walls and furniture
    wallLayer?.setCollisionByProperty({ collides: true });
    furnitureLayer?.setCollisionByProperty({ collides: true });
    
    // Create collision groups
    this.walls = this.physics.add.staticGroup();
    this.furniture = this.physics.add.staticGroup();
    
    // Add collision objects from layers
    if (wallLayer) {
      wallLayer.forEachTile((tile) => {
        if (tile.properties.collides) {
          const wall = this.walls!.create(tile.x * 32 + 16, tile.y * 32 + 16, '') as Phaser.Physics.Arcade.Sprite;
          wall.setSize(32, 32);
          wall.setVisible(false);
        }
      });
    }
    
    if (furnitureLayer) {
      furnitureLayer.forEachTile((tile) => {
        if (tile.properties.collides) {
          const furn = this.furniture!.create(tile.x * 32 + 16, tile.y * 32 + 16, '') as Phaser.Physics.Arcade.Sprite;
          furn.setSize(32, 32);
          furn.setVisible(false);
        }
      });
    }
    
    // Create player
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    
    // Set up collisions
    this.physics.add.collider(this.player, this.walls!);
    this.physics.add.collider(this.player, this.furniture!);
    
    // Create agents
    this.createAgents();
    
    // Set up camera
    this.cameras.main.startFollow(this.player);
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    
    // Set up input
    this.cursors = this.input.keyboard?.createCursorKeys();
    
    // Add interaction text
    this.interactionText = this.add.text(400, 500, '', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 },
    });
    this.interactionText.setScrollFactor(0);
    this.interactionText.setVisible(false);
    
    // Listen for E key to interact
    this.input.keyboard?.on('keydown-E', () => {
      if (this.nearbyAgent) {
        this.openChat(this.nearbyAgent);
      }
    });
  }

  createAgents() {
    const storeState = useStore.getState();
    const agents = storeState.agents;
    
    // Define positions for different states
    const deskPositions = [
      { x: 200, y: 200 },
      { x: 300, y: 200 },
      { x: 400, y: 200 },
      { x: 500, y: 200 },
      { x: 200, y: 350 },
      { x: 300, y: 350 },
    ];
    
    const meetingPosition = { x: 600, y: 400 };
    const loungePosition = { x: 250, y: 450 };
    
    agents.forEach((agent, index) => {
      let position;
      
      switch (agent.taskStatus) {
        case 'working':
          position = deskPositions[index % deskPositions.length];
          break;
        case 'meeting':
          position = meetingPosition;
          break;
        case 'idle':
        default:
          position = loungePosition;
          break;
      }
      
      const sprite = this.physics.add.sprite(position.x, position.y, 'agent');
      sprite.setData('agentId', agent.id);
      sprite.setData('agentName', agent.name);
      sprite.setData('targetX', position.x);
      sprite.setData('targetY', position.y);
      
      this.agents.set(agent.id, sprite);
      
      // Set up collisions
      this.physics.add.collider(sprite, this.walls!);
      this.physics.add.collider(sprite, this.furniture!);
    });
  }

  update() {
    if (!this.player || !this.cursors) return;
    
    const speed = 160;
    
    // Player movement
    this.player.setVelocity(0);
    
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    }
    
    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    }
    
    // Normalize diagonal movement
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    if (body && body.velocity.x !== 0 && body.velocity.y !== 0) {
      this.player.setVelocity(
        body.velocity.x * 0.707,
        body.velocity.y * 0.707
      );
    }
    
    // Agent AI movement
    this.agents.forEach((sprite) => {
      this.moveAgentToTarget(sprite);
    });
    
    // Check proximity to agents
    this.checkAgentProximity();
  }

  moveAgentToTarget(sprite: Phaser.Physics.Arcade.Sprite) {
    const targetX = sprite.getData('targetX');
    const targetY = sprite.getData('targetY');
    
    if (!targetX || !targetY) return;
    
    const distance = Phaser.Math.Distance.Between(sprite.x, sprite.y, targetX, targetY);
    
    if (distance > 5) {
      const angle = Phaser.Math.Angle.Between(sprite.x, sprite.y, targetX, targetY);
      const speed = 80;
      
      sprite.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );
    } else {
      sprite.setVelocity(0);
      
      // Randomly wander after reaching target
      if (Math.random() < 0.01) {
        const newTargetX = sprite.x + Phaser.Math.Between(-100, 100);
        const newTargetY = sprite.y + Phaser.Math.Between(-100, 100);
        sprite.setData('targetX', newTargetX);
        sprite.setData('targetY', newTargetY);
      }
    }
  }

  checkAgentProximity() {
    if (!this.player || !this.interactionText) return;
    
    let nearestAgent: string | null = null;
    let nearestDistance = 80; // Interaction radius
    
    this.agents.forEach((sprite) => {
      const distance = Phaser.Math.Distance.Between(
        this.player!.x,
        this.player!.y,
        sprite.x,
        sprite.y
      );
      
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestAgent = sprite.getData('agentId');
      }
    });
    
    if (nearestAgent) {
      this.nearbyAgent = nearestAgent;
      const agentSprite = this.agents.get(nearestAgent);
      const agentName = agentSprite?.getData('agentName') || 'Agent';
      this.interactionText.setText(`Press E to chat with ${agentName}`);
      this.interactionText.setVisible(true);
    } else {
      this.nearbyAgent = null;
      this.interactionText.setVisible(false);
    }
  }

  openChat(agentId: string) {
    const storeState = useStore.getState();
    const agent = storeState.agents.find((a) => a.id === agentId);
    
    if (agent) {
      storeState.selectAgent(agent);
      storeState.toggleChat(true);
    }
  }
}
