// Charts Module - SVG-based chart creation

/**
 * Charts class for creating SVG-based visualizations
 */
class Charts {
    
    /**
     * Create XP progress over time chart
     * @param {Array} transactions - Transaction data
     * @param {string} containerId - Container element ID
     */
    static createXPProgressChart(transactions, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !transactions || transactions.length === 0) {
            container.innerHTML = '<p>No XP data available for chart</p>';
            return;
        }

        // Chart dimensions
        const width = 600;
        const height = 300;
        const margin = { top: 20, right: 30, bottom: 40, left: 60 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        // Process data - calculate cumulative XP
        let cumulativeXP = 0;
        const chartData = transactions.map(t => {
            cumulativeXP += t.amount;
            return {
                date: new Date(t.createdAt),
                xp: cumulativeXP,
                amount: t.amount
            };
        });

        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        // Background
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('width', width);
        bg.setAttribute('height', height);
        bg.setAttribute('fill', '#f8f9fa');
        bg.setAttribute('stroke', '#dee2e6');
        svg.appendChild(bg);

        // Chart group
        const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);

        // Scales
        const minDate = chartData[0].date;
        const maxDate = chartData[chartData.length - 1].date;
        const maxXP = Math.max(...chartData.map(d => d.xp));

        // Create path for line
        let pathData = '';
        chartData.forEach((point, index) => {
            const x = (point.date - minDate) / (maxDate - minDate) * chartWidth;
            const y = chartHeight - (point.xp / maxXP * chartHeight);
            
            if (index === 0) {
                pathData += `M ${x} ${y}`;
            } else {
                pathData += ` L ${x} ${y}`;
            }
        });

        // Line path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', CONFIG.CHART_COLORS.primary);
        path.setAttribute('stroke-width', '3');
        chartGroup.appendChild(path);

        // Add data points
        chartData.forEach(point => {
            const x = (point.date - minDate) / (maxDate - minDate) * chartWidth;
            const y = chartHeight - (point.xp / maxXP * chartHeight);
            
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', y);
            circle.setAttribute('r', '4');
            circle.setAttribute('fill', CONFIG.CHART_COLORS.primary);
            circle.setAttribute('stroke', 'white');
            circle.setAttribute('stroke-width', '2');
            
            // Add tooltip
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            title.textContent = `Date: ${Utils.formatDate(point.date)}\nXP: ${Utils.formatXP(point.xp)}\nGained: ${Utils.formatXP(point.amount)}`;
            circle.appendChild(title);
            
            chartGroup.appendChild(circle);
        });

        // Axes
        this.addAxes(chartGroup, chartWidth, chartHeight, minDate, maxDate, maxXP);

        svg.appendChild(chartGroup);
        container.innerHTML = '';
        container.appendChild(svg);
    }

    /**
     * Create audit ratio chart
     * @param {number} auditUp - Audit up amount
     * @param {number} auditDown - Audit down amount
     * @param {string} containerId - Container element ID
     */
    static createAuditRatioChart(auditUp, auditDown, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const width = 400;
        const height = 200;
        const margin = 20;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        // Background
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('width', width);
        bg.setAttribute('height', height);
        bg.setAttribute('fill', '#f8f9fa');
        bg.setAttribute('stroke', '#dee2e6');
        svg.appendChild(bg);

        if (auditUp === 0 && auditDown === 0) {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', width / 2);
            text.setAttribute('y', height / 2);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', '#666');
            text.textContent = 'No audit data available';
            svg.appendChild(text);
            container.innerHTML = '';
            container.appendChild(svg);
            return;
        }

        const maxValue = Math.max(auditUp, auditDown);
        const barHeight = 30;
        const barY1 = 60;
        const barY2 = 120;

        // Audit Up bar
        const upWidth = maxValue > 0 ? (auditUp / maxValue) * (width - 2 * margin) : 0;
        const upRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        upRect.setAttribute('x', margin);
        upRect.setAttribute('y', barY1);
        upRect.setAttribute('width', upWidth);
        upRect.setAttribute('height', barHeight);
        upRect.setAttribute('fill', CONFIG.CHART_COLORS.success);
        svg.appendChild(upRect);

        // Audit Down bar
        const downWidth = maxValue > 0 ? (auditDown / maxValue) * (width - 2 * margin) : 0;
        const downRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        downRect.setAttribute('x', margin);
        downRect.setAttribute('y', barY2);
        downRect.setAttribute('width', downWidth);
        downRect.setAttribute('height', barHeight);
        downRect.setAttribute('fill', CONFIG.CHART_COLORS.danger);
        svg.appendChild(downRect);

        // Labels
        const upLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        upLabel.setAttribute('x', margin);
        upLabel.setAttribute('y', barY1 - 5);
        upLabel.setAttribute('fill', '#333');
        upLabel.setAttribute('font-size', '14');
        upLabel.textContent = `Audit Given: ${Utils.formatXP(auditUp)}`;
        svg.appendChild(upLabel);

        const downLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        downLabel.setAttribute('x', margin);
        downLabel.setAttribute('y', barY2 - 5);
        downLabel.setAttribute('fill', '#333');
        downLabel.setAttribute('font-size', '14');
        downLabel.textContent = `Audit Received: ${Utils.formatXP(auditDown)}`;
        svg.appendChild(downLabel);

        container.innerHTML = '';
        container.appendChild(svg);
    }

    /**
     * Create project pass/fail ratio pie chart
     * @param {number} passed - Number of passed projects
     * @param {number} failed - Number of failed projects
     * @param {string} containerId - Container element ID
     */
    static createProjectRatioChart(passed, failed, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const size = 200;
        const radius = 80;
        const centerX = size / 2;
        const centerY = size / 2;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);

        const total = passed + failed;
        if (total === 0) {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', centerX);
            text.setAttribute('y', centerY);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', '#666');
            text.textContent = 'No project data';
            svg.appendChild(text);
            container.innerHTML = '';
            container.appendChild(svg);
            return;
        }

        const passedAngle = (passed / total) * 2 * Math.PI;
        const failedAngle = (failed / total) * 2 * Math.PI;

        // Passed slice
        if (passed > 0) {
            const passedPath = this.createPieSlice(centerX, centerY, radius, 0, passedAngle);
            passedPath.setAttribute('fill', CONFIG.CHART_COLORS.success);
            passedPath.setAttribute('stroke', 'white');
            passedPath.setAttribute('stroke-width', '2');
            
            const passedTitle = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            passedTitle.textContent = `Passed: ${passed} (${Utils.calculatePercentage(passed, total)}%)`;
            passedPath.appendChild(passedTitle);
            
            svg.appendChild(passedPath);
        }

        // Failed slice
        if (failed > 0) {
            const failedPath = this.createPieSlice(centerX, centerY, radius, passedAngle, passedAngle + failedAngle);
            failedPath.setAttribute('fill', CONFIG.CHART_COLORS.danger);
            failedPath.setAttribute('stroke', 'white');
            failedPath.setAttribute('stroke-width', '2');
            
            const failedTitle = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            failedTitle.textContent = `Failed: ${failed} (${Utils.calculatePercentage(failed, total)}%)`;
            failedPath.appendChild(failedTitle);
            
            svg.appendChild(failedPath);
        }

        // Center text
        const centerText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        centerText.setAttribute('x', centerX);
        centerText.setAttribute('y', centerY - 5);
        centerText.setAttribute('text-anchor', 'middle');
        centerText.setAttribute('fill', '#333');
        centerText.setAttribute('font-size', '16');
        centerText.setAttribute('font-weight', 'bold');
        centerText.textContent = `${Utils.calculatePercentage(passed, total)}%`;
        svg.appendChild(centerText);

        const centerSubtext = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        centerSubtext.setAttribute('x', centerX);
        centerSubtext.setAttribute('y', centerY + 15);
        centerSubtext.setAttribute('text-anchor', 'middle');
        centerSubtext.setAttribute('fill', '#666');
        centerSubtext.setAttribute('font-size', '12');
        centerSubtext.textContent = 'Pass Rate';
        svg.appendChild(centerSubtext);

        container.innerHTML = '';
        container.appendChild(svg);
    }

    /**
     * Create skills radar chart (bonus)
     * @param {Array} skills - Skills data
     * @param {string} containerId - Container element ID
     */
    static createSkillsChart(skills, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !skills || skills.length === 0) {
            container.innerHTML = '<p>No skills data available</p>';
            return;
        }

        // Simple bar chart for skills
        const width = 400;
        const height = 300;
        const margin = { top: 20, right: 20, bottom: 60, left: 100 };
        const chartWidth = width - margin.left - margin.right;
        const chartHeight = height - margin.top - margin.bottom;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', `0 0 ${width} ${height}`);

        // Background
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('width', width);
        bg.setAttribute('height', height);
        bg.setAttribute('fill', '#f8f9fa');
        bg.setAttribute('stroke', '#dee2e6');
        svg.appendChild(bg);

        const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        chartGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);

        // Process top 5 skills
        const topSkills = skills
            .slice(0, 5)
            .sort((a, b) => b.amount - a.amount);

        const maxAmount = Math.max(...topSkills.map(s => s.amount));
        const barHeight = chartHeight / topSkills.length - 10;

        topSkills.forEach((skill, index) => {
            const y = index * (barHeight + 10);
            const barWidth = (skill.amount / maxAmount) * chartWidth;

            // Bar
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', 0);
            rect.setAttribute('y', y);
            rect.setAttribute('width', barWidth);
            rect.setAttribute('height', barHeight);
            rect.setAttribute('fill', CONFIG.CHART_COLORS.info);
            chartGroup.appendChild(rect);

            // Label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', -5);
            label.setAttribute('y', y + barHeight / 2 + 5);
            label.setAttribute('text-anchor', 'end');
            label.setAttribute('fill', '#333');
            label.setAttribute('font-size', '12');
            label.textContent = skill.object?.name || `Skill ${index + 1}`;
            chartGroup.appendChild(label);

            // Value
            const value = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            value.setAttribute('x', barWidth + 5);
            value.setAttribute('y', y + barHeight / 2 + 5);
            value.setAttribute('fill', '#333');
            value.setAttribute('font-size', '12');
            value.textContent = skill.amount;
            chartGroup.appendChild(value);
        });

        svg.appendChild(chartGroup);
        container.innerHTML = '';
        container.appendChild(svg);
    }

    /**
     * Helper method to create pie slice path
     */
    static createPieSlice(centerX, centerY, radius, startAngle, endAngle) {
        const x1 = centerX + radius * Math.cos(startAngle);
        const y1 = centerY + radius * Math.sin(startAngle);
        const x2 = centerX + radius * Math.cos(endAngle);
        const y2 = centerY + radius * Math.sin(endAngle);
        
        const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;
        
        const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
            'Z'
        ].join(' ');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', pathData);
        return path;
    }

    /**
     * Helper method to add axes to charts
     */
    static addAxes(chartGroup, chartWidth, chartHeight, minDate, maxDate, maxValue) {
        // X-axis
        const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        xAxis.setAttribute('x1', 0);
        xAxis.setAttribute('y1', chartHeight);
        xAxis.setAttribute('x2', chartWidth);
        xAxis.setAttribute('y2', chartHeight);
        xAxis.setAttribute('stroke', '#333');
        xAxis.setAttribute('stroke-width', '1');
        chartGroup.appendChild(xAxis);

        // Y-axis
        const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        yAxis.setAttribute('x1', 0);
        yAxis.setAttribute('y1', 0);
        yAxis.setAttribute('x2', 0);
        yAxis.setAttribute('y2', chartHeight);
        yAxis.setAttribute('stroke', '#333');
        yAxis.setAttribute('stroke-width', '1');
        chartGroup.appendChild(yAxis);

        // Axis labels
        const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        xLabel.setAttribute('x', chartWidth / 2);
        xLabel.setAttribute('y', chartHeight + 30);
        xLabel.setAttribute('text-anchor', 'middle');
        xLabel.setAttribute('font-size', '12');
        xLabel.setAttribute('fill', '#666');
        xLabel.textContent = 'Time';
        chartGroup.appendChild(xLabel);

        const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yLabel.setAttribute('x', -30);
        yLabel.setAttribute('y', chartHeight / 2);
        yLabel.setAttribute('text-anchor', 'middle');
        yLabel.setAttribute('font-size', '12');
        yLabel.setAttribute('fill', '#666');
        yLabel.setAttribute('transform', `rotate(-90, -30, ${chartHeight / 2})`);
        yLabel.textContent = 'XP';
        chartGroup.appendChild(yLabel);
    }
}

// Export to global scope
window.Charts = Charts;
