/**
 * Service for calculating advanced tokenomics and security mechanics
 */
export class TokenomicsService {
    private static instance: TokenomicsService;

    public static getInstance() {
        if (!this.instance) this.instance = new TokenomicsService();
        return this.instance;
    }

    /**
     * Calculates the "Point of Friction" for transaction taxes.
     * Higher taxes equate to lower trading volume.
     */
    public calculateFriction(totalTax: number): { score: number; warning: string | null } {
        // Logarithmic scale: 0-5% is green, 5-10% is yellow, >10% is red
        if (totalTax <= 5) {
            return { score: 10, warning: null };
        } else if (totalTax <= 10) {
            return { score: 5, warning: "Warning: High taxes may discourage frequent trading volume." };
        } else {
            return { score: 1, warning: "Critical: Excessive taxes cause significant trading friction and may lead to DEX delisting." };
        }
    }

    /**
     * Generates a monthly linear vesting schedule
     */
    public generateVestingSchedule(
        totalAllocation: number, 
        vestingMonths: number, 
        cliffMonths: number = 0,
        startDate: Date = new Date()
    ) {
        const schedule = [];
        const monthlyRelease = totalAllocation / vestingMonths;

        for (let i = 1; i <= vestingMonths + cliffMonths; i++) {
            const releaseDate = new Date(startDate);
            releaseDate.setMonth(startDate.getMonth() + i);

            const isLocked = i <= cliffMonths;
            const amount = isLocked ? 0 : monthlyRelease;

            schedule.push({
                month: i,
                date: releaseDate.toISOString().split('T')[0],
                amount: amount.toFixed(0),
                status: isLocked ? 'Cliff' : 'Released'
            });
        }

        return schedule;
    }

    /**
     * Estimates the "Revenue Sink" impact over a simulated volume
     */
    public estimateBurnImpact(totalSupply: number, dailyVolume: number, burnRate: number) {
        const dailyBurn = dailyVolume * (burnRate / 100);
        const yearlyBurn = dailyBurn * 365;
        const deflationPercentage = (yearlyBurn / totalSupply) * 100;

        return {
            dailyBurn,
            yearlyBurn,
            deflationPercentage: deflationPercentage.toFixed(2)
        };
    }
}
