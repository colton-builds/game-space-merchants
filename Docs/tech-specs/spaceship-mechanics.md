# Spaceship and Gameplay Mechanics

## Overview
This document outlines the technical specifications for implementing the spaceship mechanics, player controls, and gameplay systems. The implementation focuses on providing an engaging trading experience while maintaining realistic physics and intuitive controls.

## 1. Spaceship Properties

### 1.1 Base Ship Configuration
```typescript
interface Spaceship {
    // Core Properties
    mass: number;            // Base: 100 units
    maxCargoTons: number;    // Base: 100 tons
    maxBoostPulses: number;  // Base: 5 pulses
    baseThrustForce: number; // Base: 50 units
    
    // State
    position: Vector2D;
    velocity: Vector2D;
    currentPlanet: Planet | null;
    inventory: Map<string, number>;
    money: number;
    
    // Upgrade Levels
    engineLevel: number;     // Range: 1-5
    cargoLevel: number;      // Range: 1-5
    boostLevel: number;      // Range: 1-3
}
```

### 1.2 Ship States
```typescript
enum ShipState {
    ON_PLANET,    // Landed on a planet
    AIMING,       // Preparing to launch
    IN_SPACE,     // In transit between planets
    GAME_OVER     // Destroyed or out of fuel
}
```

## 2. Player Controls

### 2.1 Movement Controls
```typescript
interface MovementControls {
    // Surface Movement (when landed)
    rotateLeft: string;      // Default: 'ArrowLeft'
    rotateRight: string;     // Default: 'ArrowRight'
    
    // Launch Controls
    startAiming: string;     // Default: 'Mouse1'
    launch: string;          // Default: 'Mouse1 Release'
    
    // Space Controls
    boost: string;           // Default: 'Space'
    eject: string;          // Default: 'Escape'
}
```

### 2.2 UI Controls
```typescript
interface UIControls {
    pause: string;           // Default: 'P'
    tradeMenu: string;       // Default: 'T'
    mapView: string;         // Default: 'M'
    settings: string;        // Default: 'S'
}
```

## 3. Upgrade System

### 3.1 Ship Upgrades
```typescript
interface ShipUpgrade {
    level: number;
    cost: number;
    maxCargoTons: number;
    maxBoostPulses: number;
}

const SHIP_UPGRADES: ShipUpgrade[] = [
    { level: 1, cost: 0, maxCargoTons: 100, maxBoostPulses: 3 },      // Starting Ship
    { level: 2, cost: 50, maxCargoTons: 250, maxBoostPulses: 5 },     // Medium Ship
    { level: 3, cost: 200, maxCargoTons: 500, maxBoostPulses: 8 }     // Large Ship
];
```

### 3.2 Error Handling
```typescript
interface ErrorHandling {
    // Ship Recovery
    ejectToNearestPlanet: {
        cost: number;        // Cost to use escape pod
        cooldown: number;    // Time before eject can be used again
    };
    
    // Error Reporting
    consoleLogging: {
        enabled: boolean;    // Whether to log to console
        level: 'debug' | 'info' | 'warn' | 'error';
    };
    
    // User Feedback
    errorDisplay: {
        position: Vector2D;  // Where errors appear on screen
        duration: number;    // How long errors stay visible
        priority: number;    // Error importance level
    };
}
```

## 4. Trading System

### 4.1 Trade Mechanics
```typescript
interface TradeSystem {
    // Market Data
    buyPrice: number;
    sellPrice: number;
    supplyLevel: number;
    demandLevel: number;
    
    // Transaction Limits
    maxTransactionSize: number;
    minTransactionSize: number;
    
    // Price Factors
    distanceMultiplier: number;
    supplyDemandMultiplier: number;
}
```

### 4.2 Price Calculation
```typescript
function calculatePrice(basePrice: number, factors: PriceFactors): number {
    return basePrice * 
           factors.distanceMultiplier * 
           factors.supplyDemandMultiplier * 
           factors.marketVolatility;
}
```

## 4. Camera and View Controls

### 4.1 Zoom System
```typescript
interface ZoomSystem {
    // Zoom Constraints
    minZoom: number;         // Minimum zoom level (closest)
    maxZoom: number;         // Maximum zoom level (furthest)
    zoomTransition: {
        threshold: number;   // Zoom level at which to transition to full map view
        duration: number;    // Duration of transition animation
    };
    
    // Zoom Controls
    zoomSpeed: number;       // How fast zoom changes
    zoomSmoothing: number;   // How smooth zoom transitions are
    zoomBounds: {
        minDistance: number; // Minimum distance from player
        maxDistance: number; // Maximum distance from player
    };
}
```

## 5. Gameplay Systems

### 5.1 Economy System
- Dynamic market prices based on supply and demand
- Production chains affecting commodity prices
- Random events impacting market conditions
- Price fluctuations based on distance

### 5.2 Mission System
```typescript
interface Mission {
    type: MissionType;
    targetPlanet: Planet;
    requiredCargo: Map<string, number>;
    reward: number;
    timeLimit: number;
    difficulty: number;
}
```

### 5.3 Event System
- Random events affecting planets and markets
- Natural disasters
- Economic booms and busts
- Political changes
- Technological breakthroughs

## 6. User Interface

### 6.1 HUD Elements
- Current money and cargo status
- Ship status and fuel
- Current planet information
- Navigation markers
- Event notifications

### 6.2 Trade Interface
- Buy/Sell menu
- Price information
- Supply/Demand indicators
- Transaction history
- Market trends

### 6.3 Map Interface
- Solar system view
- Planet information
- Trade routes
- Price indicators
- Event markers

## 7. Performance Considerations

### 7.1 Physics Optimization
- Simplified collision detection
- Optimized force calculations
- Efficient trajectory prediction
- Cached gravitational forces

### 7.2 UI Performance
- Efficient rendering of HUD elements
- Optimized map rendering
- Smooth animations
- Responsive controls

## 8. Testing Requirements

### 8.1 Testing Methodology
- Manual testing by user
- Console-based debugging
- Error logging to browser console
- Visual feedback for critical errors

### 8.2 Error Scenarios
- Ship stuck in gravitational field
  - Solution: Eject to nearest planet
  - Cost: 1M credits
  - Cooldown: 5 minutes
- Physics calculation errors
  - Log to console
  - Attempt recovery
  - Display error to user if unrecoverable
- Market calculation errors
  - Log to console
  - Use last valid state
  - Display error to user if persistent

## 9. Implementation Phases

### Phase 1: Core Mechanics
- Basic ship movement
- Simple trading system
- Essential UI elements
- Basic upgrade system

### Phase 2: Enhanced Features
- Advanced trading mechanics
- Mission system
- Event system
- Advanced UI features

### Phase 3: Polish
- UI/UX improvements
- Balance adjustments
- Performance optimization
- Bug fixes and refinements 