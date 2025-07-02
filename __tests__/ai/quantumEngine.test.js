/**
 * Quantum Engine Tests
 * Unit tests for the quantum-inspired analysis engine
 */

import { QuantumEngine } from '../../src/lib/ai/quantumEngine.js';

describe('QuantumEngine', () => {
    let quantumEngine;

    beforeEach(() => {
        quantumEngine = new QuantumEngine();
    });

    describe('Initialization', () => {
        it('should initialize with default parameters', () => {
            expect(quantumEngine.numQubits).toBe(8);
            expect(quantumEngine.numCircuits).toBe(5);
            expect(quantumEngine.entanglementThreshold).toBe(0.7);
            expect(quantumEngine.coherenceDecayRate).toBe(0.1);
            expect(quantumEngine.circuits).toHaveLength(0);
            expect(quantumEngine.quantumState).toHaveLength(0);
        });

        it('should initialize with custom parameters', () => {
            const customEngine = new QuantumEngine({
                numQubits: 16,
                numCircuits: 10,
                entanglementThreshold: 0.8,
                coherenceDecayRate: 0.05
            });

            expect(customEngine.numQubits).toBe(16);
            expect(customEngine.numCircuits).toBe(10);
            expect(customEngine.entanglementThreshold).toBe(0.8);
            expect(customEngine.coherenceDecayRate).toBe(0.05);
        });
    });

    describe('Quantum Circuit Creation', () => {
        beforeEach(() => {
            quantumEngine.initialize();
        });

        it('should create quantum circuits', () => {
            expect(quantumEngine.circuits).toHaveLength(quantumEngine.numCircuits);

            quantumEngine.circuits.forEach(circuit => {
                expect(circuit).toHaveProperty('id');
                expect(circuit).toHaveProperty('gates');
                expect(circuit).toHaveProperty('entanglement');
                expect(circuit).toHaveProperty('coherence');
                expect(Array.isArray(circuit.gates)).toBe(true);
            });
        });

        it('should generate different circuits', () => {
            const circuitIds = quantumEngine.circuits.map(c => c.id);
            const uniqueIds = new Set(circuitIds);
            expect(uniqueIds.size).toBe(circuitIds.length);
        });

        it('should create circuits with quantum gates', () => {
            const circuit = quantumEngine.circuits[0];
            expect(circuit.gates.length).toBeGreaterThan(0);

            const validGates = ['H', 'X', 'Y', 'Z', 'CNOT', 'RX', 'RY', 'RZ'];
            circuit.gates.forEach(gate => {
                expect(validGates).toContain(gate.type);
                expect(gate).toHaveProperty('qubit');
                expect(gate.qubit).toBeGreaterThanOrEqual(0);
                expect(gate.qubit).toBeLessThan(quantumEngine.numQubits);
            });
        });
    });

    describe('Quantum State Management', () => {
        beforeEach(() => {
            quantumEngine.initialize();
        });

        it('should initialize quantum state', () => {
            expect(quantumEngine.quantumState).toHaveLength(Math.pow(2, quantumEngine.numQubits));

            // First state should be |00...0⟩ = 1, others should be 0
            expect(Math.abs(quantumEngine.quantumState[0])).toBeCloseTo(1, 5);
            for (let i = 1; i < quantumEngine.quantumState.length; i++) {
                expect(Math.abs(quantumEngine.quantumState[i])).toBeCloseTo(0, 5);
            }
        });

        it('should maintain state normalization', () => {
            const sumOfSquares = quantumEngine.quantumState.reduce((sum, amplitude) =>
                sum + Math.pow(Math.abs(amplitude), 2), 0);

            expect(sumOfSquares).toBeCloseTo(1, 5);
        });

        it('should update quantum state after applying gates', () => {
            const initialState = [...quantumEngine.quantumState];

            // Apply a Hadamard gate to create superposition
            quantumEngine.applyGate({ type: 'H', qubit: 0 });

            expect(quantumEngine.quantumState).not.toEqual(initialState);

            // Check normalization is maintained
            const sumOfSquares = quantumEngine.quantumState.reduce((sum, amplitude) =>
                sum + Math.pow(Math.abs(amplitude), 2), 0);
            expect(sumOfSquares).toBeCloseTo(1, 5);
        });
    });

    describe('Quantum Gate Operations', () => {
        beforeEach(() => {
            quantumEngine.initialize();
        });

        it('should apply Hadamard gate correctly', () => {
            quantumEngine.applyGate({ type: 'H', qubit: 0 });

            // After H gate on qubit 0, we should have |0⟩ + |1⟩ / √2
            expect(Math.abs(quantumEngine.quantumState[0])).toBeCloseTo(1 / Math.sqrt(2), 5);
            expect(Math.abs(quantumEngine.quantumState[1])).toBeCloseTo(1 / Math.sqrt(2), 5);
        });

        it('should apply Pauli-X gate correctly', () => {
            quantumEngine.applyGate({ type: 'X', qubit: 0 });

            // After X gate on qubit 0, we should have |1⟩
            expect(Math.abs(quantumEngine.quantumState[0])).toBeCloseTo(0, 5);
            expect(Math.abs(quantumEngine.quantumState[1])).toBeCloseTo(1, 5);
        });

        it('should apply CNOT gate correctly', () => {
            // First put control qubit in superposition
            quantumEngine.applyGate({ type: 'H', qubit: 0 });

            // Then apply CNOT
            quantumEngine.applyGate({ type: 'CNOT', qubit: 0, target: 1 });

            // Should create Bell state |00⟩ + |11⟩ / √2
            expect(Math.abs(quantumEngine.quantumState[0])).toBeCloseTo(1 / Math.sqrt(2), 5); // |00⟩
            expect(Math.abs(quantumEngine.quantumState[1])).toBeCloseTo(0, 5); // |01⟩
            expect(Math.abs(quantumEngine.quantumState[2])).toBeCloseTo(0, 5); // |10⟩  
            expect(Math.abs(quantumEngine.quantumState[3])).toBeCloseTo(1 / Math.sqrt(2), 5); // |11⟩
        });

        it('should handle rotation gates with parameters', () => {
            const angle = Math.PI / 4;
            quantumEngine.applyGate({ type: 'RX', qubit: 0, angle: angle });

            // State should change from initial |0⟩
            expect(quantumEngine.quantumState).not.toEqual([1, 0, 0, 0, 0, 0, 0, 0]);
        });

        it('should handle invalid gate types', () => {
            const invalidGate = { type: 'INVALID', qubit: 0 };

            expect(() => {
                quantumEngine.applyGate(invalidGate);
            }).not.toThrow(); // Should handle gracefully
        });
    });

    describe('Entanglement Calculations', () => {
        beforeEach(() => {
            quantumEngine.initialize();
        });

        it('should calculate entanglement for separable states', () => {
            // Initial state |00...0⟩ is separable
            const entanglement = quantumEngine.calculateEntanglement();
            expect(entanglement).toBeCloseTo(0, 2);
        });

        it('should calculate entanglement for Bell states', () => {
            // Create Bell state |00⟩ + |11⟩ / √2
            quantumEngine.applyGate({ type: 'H', qubit: 0 });
            quantumEngine.applyGate({ type: 'CNOT', qubit: 0, target: 1 });

            const entanglement = quantumEngine.calculateEntanglement();
            expect(entanglement).toBeGreaterThan(0.5);
        });

        it('should return entanglement between 0 and 1', () => {
            // Apply random gates
            quantumEngine.applyGate({ type: 'H', qubit: 0 });
            quantumEngine.applyGate({ type: 'H', qubit: 1 });
            quantumEngine.applyGate({ type: 'CNOT', qubit: 0, target: 1 });

            const entanglement = quantumEngine.calculateEntanglement();
            expect(entanglement).toBeGreaterThanOrEqual(0);
            expect(entanglement).toBeLessThanOrEqual(1);
        });
    });

    describe('Coherence Calculations', () => {
        beforeEach(() => {
            quantumEngine.initialize();
        });

        it('should calculate coherence for pure states', () => {
            const coherence = quantumEngine.calculateCoherence();
            expect(coherence).toBeGreaterThan(0);
            expect(coherence).toBeLessThanOrEqual(1);
        });

        it('should show different coherence for different states', () => {
            const initialCoherence = quantumEngine.calculateCoherence();

            // Apply gates and check coherence changes
            quantumEngine.applyGate({ type: 'H', qubit: 0 });
            const afterHadamardCoherence = quantumEngine.calculateCoherence();

            expect(afterHadamardCoherence).not.toEqual(initialCoherence);
        });

        it('should simulate coherence decay over time', () => {
            const initialCoherence = quantumEngine.calculateCoherence();

            quantumEngine.simulateDecoherence(1.0); // 1 time unit

            const decayedCoherence = quantumEngine.calculateCoherence();
            expect(decayedCoherence).toBeLessThan(initialCoherence);
        });
    });

    describe('Quantum Analysis', () => {
        let mockTokenData;

        beforeEach(() => {
            quantumEngine.initialize();
            mockTokenData = {
                price: 0.001,
                volume: 10000,
                market_cap: 50000,
                price_change_24h: 15.5,
                liquidity: 25000,
                holders: 1000
            };
        });

        it('should perform quantum analysis on token data', async () => {
            const analysis = await quantumEngine.analyzeToken(mockTokenData);

            expect(analysis).toHaveProperty('quantumScore');
            expect(analysis).toHaveProperty('entanglementScore');
            expect(analysis).toHaveProperty('coherenceScore');
            expect(analysis).toHaveProperty('quantumAdvantage');
            expect(analysis).toHaveProperty('confidence');
            expect(analysis).toHaveProperty('recommendation');

            expect(analysis.quantumScore).toBeGreaterThanOrEqual(0);
            expect(analysis.quantumScore).toBeLessThanOrEqual(100);
            expect(analysis.confidence).toBeGreaterThanOrEqual(0);
            expect(analysis.confidence).toBeLessThanOrEqual(1);
        });

        it('should encode token data into quantum features', () => {
            const features = quantumEngine.encodeTokenData(mockTokenData);

            expect(Array.isArray(features)).toBe(true);
            expect(features).toHaveLength(quantumEngine.numQubits);

            features.forEach(feature => {
                expect(feature).toBeGreaterThanOrEqual(0);
                expect(feature).toBeLessThanOrEqual(1);
            });
        });

        it('should create quantum circuits based on token features', () => {
            const features = quantumEngine.encodeTokenData(mockTokenData);
            const circuits = quantumEngine.createQuantumCircuits(features);

            expect(Array.isArray(circuits)).toBe(true);
            expect(circuits.length).toBeGreaterThan(0);

            circuits.forEach(circuit => {
                expect(circuit).toHaveProperty('gates');
                expect(circuit).toHaveProperty('entanglement');
                expect(circuit).toHaveProperty('coherence');
            });
        });

        it('should measure quantum circuits and get results', () => {
            const circuits = quantumEngine.circuits;
            const measurements = quantumEngine.measureCircuits(circuits);

            expect(Array.isArray(measurements)).toBe(true);
            expect(measurements).toHaveLength(circuits.length);

            measurements.forEach(measurement => {
                expect(measurement).toHaveProperty('probability');
                expect(measurement).toHaveProperty('amplitude');
                expect(measurement).toHaveProperty('phase');

                expect(measurement.probability).toBeGreaterThanOrEqual(0);
                expect(measurement.probability).toBeLessThanOrEqual(1);
            });
        });

        it('should handle edge cases in token data', async () => {
            const edgeCaseData = {
                price: 0,
                volume: 0,
                market_cap: 0,
                price_change_24h: 0,
                liquidity: 0,
                holders: 0
            };

            const analysis = await quantumEngine.analyzeToken(edgeCaseData);

            expect(analysis).toHaveProperty('quantumScore');
            expect(analysis.quantumScore).toBeGreaterThanOrEqual(0);
            expect(analysis.quantumScore).toBeLessThanOrEqual(100);
        });
    });

    describe('Quantum Scoring', () => {
        beforeEach(() => {
            quantumEngine.initialize();
        });

        it('should calculate quantum scores correctly', () => {
            const measurements = [
                { probability: 0.8, amplitude: 0.9, phase: 0.1 },
                { probability: 0.6, amplitude: 0.8, phase: 0.2 },
                { probability: 0.7, amplitude: 0.85, phase: 0.15 }
            ];

            const entanglement = 0.8;
            const coherence = 0.9;

            const score = quantumEngine.calculateQuantumScore(measurements, entanglement, coherence);

            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(100);
        });

        it('should weight different quantum metrics appropriately', () => {
            const measurements = [
                { probability: 1.0, amplitude: 1.0, phase: 0.0 }
            ];

            // High entanglement and coherence should give high score
            const highScore = quantumEngine.calculateQuantumScore(measurements, 0.9, 0.9);

            // Low entanglement and coherence should give lower score
            const lowScore = quantumEngine.calculateQuantumScore(measurements, 0.1, 0.1);

            expect(highScore).toBeGreaterThan(lowScore);
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid initialization parameters', () => {
            expect(() => {
                new QuantumEngine({ numQubits: -1 });
            }).not.toThrow();

            expect(() => {
                new QuantumEngine({ numCircuits: 0 });
            }).not.toThrow();
        });

        it('should handle missing token data gracefully', async () => {
            quantumEngine.initialize();

            const analysis = await quantumEngine.analyzeToken({});

            expect(analysis).toHaveProperty('quantumScore');
            expect(analysis.quantumScore).toBeGreaterThanOrEqual(0);
        });

        it('should handle null or undefined inputs', async () => {
            quantumEngine.initialize();

            const nullAnalysis = await quantumEngine.analyzeToken(null);
            const undefinedAnalysis = await quantumEngine.analyzeToken(undefined);

            expect(nullAnalysis).toHaveProperty('quantumScore');
            expect(undefinedAnalysis).toHaveProperty('quantumScore');
        });
    });

    describe('Performance', () => {
        it('should complete analysis within reasonable time', async () => {
            quantumEngine.initialize();

            const mockTokenData = {
                price: 0.001,
                volume: 10000,
                market_cap: 50000,
                price_change_24h: 15.5
            };

            const startTime = Date.now();
            await quantumEngine.analyzeToken(mockTokenData);
            const endTime = Date.now();

            expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
        });

        it('should handle multiple concurrent analyses', async () => {
            quantumEngine.initialize();

            const mockTokenData = {
                price: 0.001,
                volume: 10000,
                market_cap: 50000
            };

            const promises = Array(10).fill().map(() =>
                quantumEngine.analyzeToken(mockTokenData)
            );

            const results = await Promise.all(promises);

            expect(results).toHaveLength(10);
            results.forEach(result => {
                expect(result).toHaveProperty('quantumScore');
            });
        });
    });
});
