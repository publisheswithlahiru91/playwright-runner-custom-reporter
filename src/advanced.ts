import TddLmReporter from './tddLmReporter';

class AdvancedTddLmReporter extends TddLmReporter {
    constructor(options: ConstructorParameters<typeof TddLmReporter>[0] = {}) {
        super({ ...options, mode: 'advanced' });
    }
}

export default AdvancedTddLmReporter;
export { AdvancedTddLmReporter };
