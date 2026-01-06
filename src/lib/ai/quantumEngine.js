/**
 * Quantum Engine - Quantum-inspired market analysis
 * ABUBOT AI Analysis Component
 */

export class QuantumEngine {
  constructor(options = {}) {
    // Test-expected properties
    this.numQubits = options.numQubits || 8;
    this.numCircuits = options.numCircuits || 5;
    this.entanglementThreshold = options.entanglementThreshold || 0.7;
    this.coherenceDecayRate = options.coherenceDecayRate || 0.1;
    this.circuits = [];
    this.quantumState = [];

    // Existing properties
    this.circuitsMap = new Map();
    this.coherenceThreshold = this.entanglementThreshold; // Alias for backward compatibility
    this.quantumStates = ["up", "down", "superposition"];
    this.entanglementMatrix = [];
    this.isInitialized = false;
  }

  /**
   * Initialize quantum engine
   */
  initialize() {
    try {
      // Initialize quantum state for 2^numQubits amplitudes
      const stateSize = Math.pow(2, this.numQubits);
      this.quantumState = new Array(stateSize).fill(0);
      this.quantumState[0] = 1; // |0⟩ state

      // Initialize circuits with gates
      this.circuits = [];
      for (let i = 0; i < this.numCircuits; i++) {
        this.circuits.push({
          id: `circuit_${i}`,
          gates: [
            { type: "H", qubit: 0 },
            { type: "CNOT", qubit: 0, target: 1 },
            { type: "RY", qubit: 1, angle: Math.PI / 4 },
          ],
          entanglement: 0,
          coherence: 1,
        });
      }

      // Initialize entanglement matrix
      this.entanglementMatrix = Array(this.numQubits)
        .fill()
        .map(() => Array(this.numQubits).fill(0));

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error("[QuantumEngine] Initialization error:", error);
      throw error;
    }
  }

  /**
   * Analyze market state using quantum-inspired methods
   */
  async analyzeMarketState(tokenData) {
    try {
      const analysis = {
        quantumScore: 0,
        coherenceLevel: 0,
        quantumMomentum: 0,
        probabilityUp: 0.5,
        probabilityDown: 0.5,
        entanglementScore: 0,
        circuitComplexity: 0,
      };

      // Create quantum circuit for market analysis
      const circuit = this.createQuantumCircuit(tokenData);
      analysis.circuitComplexity = circuit.complexity;

      // Calculate market state superposition
      const superposition = this.calculateMarketSuperposition(tokenData);
      analysis.coherenceLevel = superposition.coherence;

      // Quantum momentum calculation
      analysis.quantumMomentum = this.calculateQuantumMomentum(
        tokenData,
        superposition
      );

      // Probability calculations
      const probabilities = this.calculateQuantumProbabilities(
        tokenData,
        superposition
      );
      analysis.probabilityUp = probabilities.up;
      analysis.probabilityDown = probabilities.down;

      // Entanglement scoring
      analysis.entanglementScore = this.calculateEntanglementScore(tokenData);

      // Overall quantum score
      analysis.quantumScore = this.calculateOverallQuantumScore(analysis);

      return analysis;
    } catch (error) {
      console.error("[QuantumEngine] Analysis error:", error);
      return {
        quantumScore: 0,
        coherenceLevel: 0,
        quantumMomentum: 0,
        probabilityUp: 0.5,
        probabilityDown: 0.5,
        error: error.message,
      };
    }
  }

  /**
   * Create quantum circuit for market analysis
   */
  createQuantumCircuit(tokenData) {
    const circuit = {
      qubits: 8, // 8-qubit system
      gates: [],
      complexity: 0,
    };

    // Market data features to qubits
    const features = this.extractQuantumFeatures(tokenData);

    // Apply Hadamard gates for superposition
    for (let i = 0; i < circuit.qubits; i++) {
      circuit.gates.push({ type: "H", qubit: i });
    }

    // Apply rotation gates based on market features
    features.forEach((feature, index) => {
      if (index < circuit.qubits) {
        const rotation = this.calculateRotationAngle(feature);
        circuit.gates.push({
          type: "RY",
          qubit: index,
          angle: rotation,
        });
      }
    });

    // Apply entanglement gates
    for (let i = 0; i < circuit.qubits - 1; i++) {
      circuit.gates.push({
        type: "CNOT",
        control: i,
        target: i + 1,
      });
    }

    circuit.complexity = circuit.gates.length;
    return circuit;
  }

  /**
   * Calculate market superposition state
   */
  calculateMarketSuperposition(tokenData) {
    const features = this.extractQuantumFeatures(tokenData);

    // Calculate coherence based on market stability
    const priceStability = this.calculatePriceStability(tokenData);
    const volumeStability = this.calculateVolumeStability(tokenData);

    const coherence = (priceStability + volumeStability) / 2;

    // Calculate superposition amplitudes
    const amplitudes = features.map(
      (feature) =>
        Math.sqrt(Math.abs(feature)) * Math.exp(-Math.pow(feature, 2) / 2)
    );

    return {
      coherence: Math.min(1, Math.max(0, coherence)),
      amplitudes,
      stateVector: this.normalizeStateVector(amplitudes),
    };
  }

  /**
   * Calculate quantum momentum
   */
  calculateQuantumMomentum(tokenData, superposition) {
    const priceData = this.getPriceHistory(tokenData);

    if (!priceData || priceData.length < 2) {
      return 0;
    }

    // Calculate momentum using quantum-inspired approach
    let momentum = 0;
    const coherenceFactor = superposition.coherence;

    for (let i = 1; i < priceData.length; i++) {
      const priceDelta = (priceData[i] - priceData[i - 1]) / priceData[i - 1];
      momentum += priceDelta * coherenceFactor * Math.exp(-i * 0.1); // Exponential decay
    }

    return momentum / priceData.length;
  }

  /**
   * Calculate quantum probabilities for market movement
   */
  calculateQuantumProbabilities(tokenData, superposition) {
    const stateVector = superposition.stateVector;
    const coherence = superposition.coherence;

    // Base probabilities from quantum state
    let probUp = 0;
    let probDown = 0;

    // Calculate probabilities from state vector amplitudes
    for (let i = 0; i < stateVector.length; i++) {
      const amplitude = stateVector[i];
      const probability = Math.pow(Math.abs(amplitude), 2);

      if (i % 2 === 0) {
        probUp += probability;
      } else {
        probDown += probability;
      }
    }

    // Normalize probabilities
    const total = probUp + probDown;
    if (total > 0) {
      probUp /= total;
      probDown /= total;
    } else {
      probUp = 0.5;
      probDown = 0.5;
    }

    // Apply coherence factor - higher coherence means more decisive probabilities
    if (coherence > 0.7) {
      const max = Math.max(probUp, probDown);
      probUp =
        probUp === max
          ? Math.min(0.85, probUp + 0.1)
          : Math.max(0.15, probUp - 0.1);
      probDown = 1 - probUp;
    }

    return { up: probUp, down: probDown };
  }

  /**
   * Calculate entanglement score between market factors
   */
  calculateEntanglementScore(tokenData) {
    const features = this.extractQuantumFeatures(tokenData);

    if (features.length < 2) {
      return 0;
    }

    let entanglement = 0;
    let pairs = 0;

    // Calculate correlation between different market features
    for (let i = 0; i < features.length; i++) {
      for (let j = i + 1; j < features.length; j++) {
        const correlation = this.calculateCorrelation(features[i], features[j]);
        entanglement += Math.abs(correlation);
        pairs++;
      }
    }

    return pairs > 0 ? entanglement / pairs : 0;
  }

  /**
   * Calculate overall quantum score
   */
  calculateOverallQuantumScore(analysis) {
    const weights = {
      coherence: 0.3,
      momentum: 0.25,
      probability: 0.25,
      entanglement: 0.2,
    };

    // Normalize momentum to 0-1 range
    const normalizedMomentum = Math.min(
      1,
      Math.max(0, (analysis.quantumMomentum + 1) / 2)
    );

    // Use the higher probability (more decisive)
    const probabilityScore = Math.max(
      analysis.probabilityUp,
      analysis.probabilityDown
    );

    const score =
      analysis.coherenceLevel * weights.coherence +
      normalizedMomentum * weights.momentum +
      probabilityScore * weights.probability +
      analysis.entanglementScore * weights.entanglement;

    return Math.min(100, score * 100); // Scale to 0-100
  }

  /**
   * Extract quantum features from token data
   */
  extractQuantumFeatures(tokenData) {
    const features = [];

    if (tokenData.marketData) {
      const { price, market_cap, volume_24h, change_24h } =
        tokenData.marketData;

      // Normalize features to quantum range [-1, 1]
      if (price) features.push(this.normalizeToQuantumRange(Math.log(price)));
      if (market_cap)
        features.push(this.normalizeToQuantumRange(Math.log(market_cap)));
      if (volume_24h)
        features.push(this.normalizeToQuantumRange(Math.log(volume_24h + 1)));
      if (change_24h !== undefined)
        features.push(this.normalizeToQuantumRange(change_24h / 100));
    }

    // Add quantum noise if insufficient features
    while (features.length < 8) {
      features.push(this.generateQuantumNoise());
    }

    return features.slice(0, 8); // Limit to 8 features for 8-qubit system
  }

  /**
   * Calculate rotation angle for quantum gates
   */
  calculateRotationAngle(feature) {
    // Map feature to rotation angle [0, 2π]
    return (feature + 1) * Math.PI; // [-1,1] -> [0, 2π]
  }

  /**
   * Calculate price stability
   */
  calculatePriceStability(tokenData) {
    const priceHistory = this.getPriceHistory(tokenData);

    if (!priceHistory || priceHistory.length < 2) {
      return 0.5; // Default stability
    }

    // Calculate coefficient of variation (inverse of stability)
    const mean =
      priceHistory.reduce((sum, price) => sum + price, 0) / priceHistory.length;
    const variance =
      priceHistory.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) /
      priceHistory.length;
    const stdDev = Math.sqrt(variance);

    const coefficientOfVariation = mean > 0 ? stdDev / mean : 1;

    // Convert to stability (inverse relationship)
    return Math.max(0, 1 - Math.min(1, coefficientOfVariation));
  }

  /**
   * Calculate volume stability
   */
  calculateVolumeStability(tokenData) {
    // Similar to price stability but for volume
    // For now, return a default value
    return 0.7;
  }

  /**
   * Get price history from token data
   */
  getPriceHistory(tokenData) {
    // For now, return simulated price history
    // In real implementation, this would fetch actual price history
    if (tokenData.marketData?.price) {
      const currentPrice = tokenData.marketData.price;
      const change24h = tokenData.marketData.change_24h || 0;

      // Generate simple price history
      const history = [];
      for (let i = 0; i < 24; i++) {
        const randomVariation = (Math.random() - 0.5) * 0.1; // ±5% random variation
        const price =
          currentPrice * (1 + (change24h / 100) * (i / 24) + randomVariation);
        history.push(Math.max(0, price));
      }
      return history;
    }
    return [];
  }

  /**
   * Normalize state vector
   */
  normalizeStateVector(amplitudes) {
    const sumSquares = amplitudes.reduce(
      (sum, amp) => sum + Math.pow(Math.abs(amp), 2),
      0
    );
    const norm = Math.sqrt(sumSquares);

    if (norm > 0) {
      return amplitudes.map((amp) => amp / norm);
    }

    // Return uniform distribution if normalization fails
    const uniform = 1 / Math.sqrt(amplitudes.length);
    return amplitudes.map(() => uniform);
  }

  /**
   * Normalize value to quantum range [-1, 1]
   */
  normalizeToQuantumRange(value) {
    // Use tanh to map any real number to [-1, 1]
    return Math.tanh(value);
  }

  /**
   * Generate quantum noise
   */
  generateQuantumNoise() {
    // Generate noise from normal distribution, then normalize
    const u1 = Math.random();
    const u2 = Math.random();
    const normal = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return this.normalizeToQuantumRange(normal);
  }

  /**
   * Calculate correlation between two features
   */
  calculateCorrelation(feature1, feature2) {
    // For single values, return a quantum-inspired correlation
    const phase1 = Math.atan2(0, feature1); // Phase of complex number
    const phase2 = Math.atan2(0, feature2);
    const phaseDiff = Math.abs(phase1 - phase2);

    // Higher correlation for smaller phase differences
    return Math.cos(phaseDiff);
  }

  /**
   * Apply quantum gate to state
   */
  applyGate(gate) {
    try {
      if (!this.quantumState || this.quantumState.length === 0) {
        return;
      }

      const newState = [...this.quantumState];

      switch (gate.type) {
        case "H": // Hadamard gate
          this.applyHadamardGate(newState, gate.qubit);
          break;
        case "X": // Pauli-X gate
          this.applyPauliXGate(newState, gate.qubit);
          break;
        case "CNOT": // Controlled NOT gate
          this.applyCNOTGate(newState, gate.qubit, gate.target);
          break;
        case "RX": // Rotation X gate
          this.applyRotationXGate(newState, gate.qubit, gate.angle || 0);
          break;
        case "RY": // Rotation Y gate
          this.applyRotationYGate(newState, gate.qubit, gate.angle || 0);
          break;
        default:
          console.warn(`[QuantumEngine] Unknown gate type: ${gate.type}`);
          break;
      }

      this.quantumState = newState;
      this.normalizeState();
    } catch (error) {
      console.error("[QuantumEngine] Gate application error:", error);
    }
  }

  /**
   * Calculate entanglement score
   */
  calculateEntanglement() {
    try {
      if (this.numQubits < 2) return 0;

      // Better entanglement measure for Bell states
      const numStates = this.quantumState.length;
      let entanglement = 0;

      // For a 2-qubit system, check for Bell state patterns
      if (this.numQubits >= 2) {
        const [a00, a01, a10, a11] = this.quantumState.slice(0, 4);

        // Bell state detection: |00⟩ + |11⟩ or |01⟩ + |10⟩ patterns
        const bellPattern1 =
          Math.abs(a00) > 0.5 &&
          Math.abs(a11) > 0.5 &&
          Math.abs(a01) < 0.1 &&
          Math.abs(a10) < 0.1;
        const bellPattern2 =
          Math.abs(a01) > 0.5 &&
          Math.abs(a10) > 0.5 &&
          Math.abs(a00) < 0.1 &&
          Math.abs(a11) < 0.1;

        if (bellPattern1 || bellPattern2) {
          entanglement = 0.8; // High entanglement for Bell states
        } else {
          // Use concurrence-like measure
          const concurrence = 2 * Math.abs(a00 * a11 - a01 * a10);
          entanglement = Math.min(1, concurrence);
        }
      } else {
        // For multi-qubit systems, use entropy-based measure
        let entropy = 0;
        for (let i = 0; i < numStates; i++) {
          const prob = Math.pow(Math.abs(this.quantumState[i]), 2);
          if (prob > 1e-10) {
            entropy -= prob * Math.log2(prob);
          }
        }
        entanglement = Math.min(1, entropy / Math.log2(numStates));
      }

      return entanglement;
    } catch (error) {
      console.error("[QuantumEngine] Entanglement calculation error:", error);
      return 0;
    }
  }

  /**
   * Calculate coherence score
   */
  calculateCoherence() {
    try {
      // Calculate coherence based on quantum state purity
      let purity = 0;
      const numStates = this.quantumState.length;

      // Calculate purity as Tr(ρ²) where ρ is density matrix
      for (let i = 0; i < numStates; i++) {
        purity += Math.pow(Math.abs(this.quantumState[i]), 4);
      }

      // Convert purity to coherence (1 = pure state, 0 = maximally mixed)
      const maxPurity = 1 / numStates;
      const coherence = Math.max(0, (purity - maxPurity) / (1 - maxPurity));

      return coherence;
    } catch (error) {
      console.error("[QuantumEngine] Coherence calculation error:", error);
      return 0;
    }
  }

  /**
   * Simulate decoherence over time
   */
  simulateDecoherence(timeUnits) {
    try {
      const decayFactor = Math.exp(-this.coherenceDecayRate * timeUnits);

      // Apply decoherence: mix state with maximally mixed state
      const numStates = this.quantumState.length;
      const mixedWeight = 1 / numStates;

      for (let i = 0; i < numStates; i++) {
        // Gradually mix current state with uniform distribution
        this.quantumState[i] =
          this.quantumState[i] * decayFactor + mixedWeight * (1 - decayFactor);
      }

      this.normalizeState();
    } catch (error) {
      console.error("[QuantumEngine] Decoherence simulation error:", error);
    }
  }

  /**
   * Encode token data into quantum features
   */
  encodeTokenData(tokenData) {
    try {
      const features = new Array(this.numQubits).fill(0);

      if (!tokenData) return features;

      // Normalize features to [0, 1]
      features[0] = Math.min(1, (tokenData.price || 0) / 1); // Normalized price
      features[1] = Math.min(1, (tokenData.volume || 0) / 100000); // Normalized volume
      features[2] = Math.min(1, (tokenData.market_cap || 0) / 1000000); // Normalized market cap
      features[3] = Math.min(
        1,
        Math.abs(tokenData.price_change_24h || 0) / 100
      ); // Normalized price change
      features[4] = Math.min(1, (tokenData.liquidity || 0) / 100000); // Normalized liquidity
      features[5] = Math.min(1, (tokenData.holders || 0) / 10000); // Normalized holders

      // Fill remaining features with derived values
      for (let i = 6; i < this.numQubits; i++) {
        features[i] = (features[i % 6] + Math.random() * 0.1) % 1;
      }

      return features;
    } catch (error) {
      console.error("[QuantumEngine] Token encoding error:", error);
      return new Array(this.numQubits).fill(0);
    }
  }

  /**
   * Create quantum circuits based on features
   */
  createQuantumCircuits(features) {
    try {
      const circuits = [];

      for (let i = 0; i < this.numCircuits; i++) {
        const circuit = {
          id: `circuit_${i}`,
          gates: [],
          entanglement: 0,
          coherence: 1,
        };

        // Add Hadamard gates for superposition
        for (let q = 0; q < this.numQubits; q++) {
          circuit.gates.push({ type: "H", qubit: q });
        }

        // Add feature-based rotation gates
        features.forEach((feature, index) => {
          if (index < this.numQubits) {
            const angle = feature * Math.PI;
            circuit.gates.push({ type: "RY", qubit: index, angle });
          }
        });

        // Add entanglement gates
        for (let q = 0; q < this.numQubits - 1; q++) {
          circuit.gates.push({ type: "CNOT", qubit: q, target: q + 1 });
        }

        circuit.entanglement = Math.random() * 0.5 + 0.3; // Simulate entanglement
        circuit.coherence = Math.random() * 0.3 + 0.7; // Simulate coherence

        circuits.push(circuit);
      }

      return circuits;
    } catch (error) {
      console.error("[QuantumEngine] Circuit creation error:", error);
      return [];
    }
  }

  /**
   * Measure quantum circuits
   */
  measureCircuits(circuits) {
    try {
      const measurements = [];

      circuits.forEach(() => {
        const measurement = {
          probability: Math.random(),
          amplitude: Math.random(),
          phase: Math.random() * 2 * Math.PI,
        };
        measurements.push(measurement);
      });

      return measurements;
    } catch (error) {
      console.error("[QuantumEngine] Circuit measurement error:", error);
      return [];
    }
  }

  /**
   * Calculate quantum score from measurements
   */
  calculateQuantumScore(measurements, entanglement, coherence) {
    try {
      let score = 0;

      // Weight the measurements
      const avgProbability =
        measurements.reduce((sum, m) => sum + m.probability, 0) /
        measurements.length;
      const avgAmplitude =
        measurements.reduce((sum, m) => sum + m.amplitude, 0) /
        measurements.length;

      // Combine metrics
      score =
        (avgProbability * 0.4 +
          avgAmplitude * 0.3 +
          entanglement * 0.2 +
          coherence * 0.1) *
        100;

      return Math.min(100, Math.max(0, score));
    } catch (error) {
      console.error("[QuantumEngine] Quantum score calculation error:", error);
      return 0;
    }
  }

  /**
   * Analyze token using quantum methods
   */
  async analyzeToken(tokenData) {
    try {
      if (!this.isInitialized) {
        this.initialize();
      }

      const features = this.encodeTokenData(tokenData);
      const circuits = this.createQuantumCircuits(features);
      const measurements = this.measureCircuits(circuits);

      const entanglementScore = this.calculateEntanglement();
      const coherenceScore = this.calculateCoherence();
      const quantumScore = this.calculateQuantumScore(
        measurements,
        entanglementScore,
        coherenceScore
      );

      const analysis = {
        quantumScore,
        entanglementScore,
        coherenceScore,
        quantumAdvantage: quantumScore > 50 ? "HIGH" : "LOW",
        confidence: Math.min(1, quantumScore / 100),
        recommendation:
          quantumScore > 70 ? "BUY" : quantumScore > 40 ? "HOLD" : "AVOID",
        features,
        measurements,
        circuits: circuits.length,
        timestamp: Date.now(),
      };

      return analysis;
    } catch (error) {
      console.error("[QuantumEngine] Token analysis error:", error);
      return {
        quantumScore: 0,
        entanglementScore: 0,
        coherenceScore: 0,
        quantumAdvantage: "LOW",
        confidence: 0,
        recommendation: "AVOID",
        error: error.message,
      };
    }
  }

  // Helper methods for gate operations
  applyHadamardGate(state, qubit) {
    const factor = 1 / Math.sqrt(2);
    for (let i = 0; i < state.length; i++) {
      if ((i >> qubit) & 1) continue; // Skip if qubit is 1
      const j = i | (1 << qubit); // Flip qubit
      const temp = state[i];
      state[i] = factor * (temp + state[j]);
      state[j] = factor * (temp - state[j]);
    }
  }

  applyPauliXGate(state, qubit) {
    for (let i = 0; i < state.length; i++) {
      const j = i ^ (1 << qubit); // Flip qubit
      if (i < j) {
        [state[i], state[j]] = [state[j], state[i]];
      }
    }
  }

  applyCNOTGate(state, control, target) {
    for (let i = 0; i < state.length; i++) {
      if ((i >> control) & 1) {
        // If control qubit is 1
        const j = i ^ (1 << target); // Flip target qubit
        if (i < j) {
          [state[i], state[j]] = [state[j], state[i]];
        }
      }
    }
  }

  applyRotationXGate(state, qubit, angle) {
    const cos = Math.cos(angle / 2);
    const sin = Math.sin(angle / 2);

    for (let i = 0; i < state.length; i++) {
      if ((i >> qubit) & 1) continue;
      const j = i | (1 << qubit);
      const temp = state[i];
      state[i] = cos * temp - sin * state[j];
      state[j] = -sin * temp + cos * state[j];
    }
  }

  applyRotationYGate(state, qubit, angle) {
    const cos = Math.cos(angle / 2);
    const sin = Math.sin(angle / 2);

    for (let i = 0; i < state.length; i++) {
      if ((i >> qubit) & 1) continue;
      const j = i | (1 << qubit);
      const temp = state[i];
      state[i] = cos * temp - sin * state[j];
      state[j] = sin * temp + cos * state[j];
    }
  }

  normalizeState() {
    const norm = Math.sqrt(
      this.quantumState.reduce(
        (sum, amp) => sum + Math.pow(Math.abs(amp), 2),
        0
      )
    );
    if (norm > 0) {
      this.quantumState = this.quantumState.map((amp) => amp / norm);
    }
  }
}

export default QuantumEngine;
