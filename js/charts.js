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
        if (!container) {
            console.error(`❌ Chart container not found: ${containerId}`);
            return;
        }

        if (!transactions || transactions.length === 0) {
            container.innerHTML = '<p style="color: var(--color-text-secondary); text-align: center; padding: 20px;">No XP data available for chart</p>';
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
        bg.setAttribute('fill', CONFIG.CHART_COLORS.background);
        bg.setAttribute('stroke', CONFIG.CHART_COLORS.border);
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
        path.setAttribute('filter', 'drop-shadow(0 0 4px rgba(0, 255, 136, 0.3))');
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
            circle.setAttribute('stroke', CONFIG.CHART_COLORS.background);
            circle.setAttribute('stroke-width', '2');
            circle.setAttribute('filter', 'drop-shadow(0 0 3px rgba(0, 255, 136, 0.5))');
            
            // Add tooltip
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            title.textContent = `Date: ${Utils.formatDate(point.date)}\nXP: ${Utils.formatXP(point.xp)}\nGained: ${Utils.formatXP(point.amount)}`;
            circle.appendChild(title);
            
            chartGroup.appendChild(circle);
        });

        // Axes
        this.addAxes(chartGroup, chartWidth, chartHeight);

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
        bg.setAttribute('fill', CONFIG.CHART_COLORS.background);
        bg.setAttribute('stroke', CONFIG.CHART_COLORS.border);
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
     * Create skills chart (bonus)
     * @param {Array} skills - Skills data
     * @param {string} containerId - Container element ID
     */
    static createSkillsChart(skills, containerId) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`❌ Skills chart container not found: ${containerId}`);
            return;
        }

        if (!skills || skills.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: var(--color-text-secondary);">
                    <div style="font-size: 48px; margin-bottom: 16px;">🎯</div>
                    <p>Skills data will appear here as you complete more projects!</p>
                    <p style="font-size: 14px; margin-top: 8px;">Keep coding to unlock your skill breakdown.</p>
                </div>
            `;
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
     * Create XP earned by project chart
     * @param {Array} transactions - Transaction data with project info
     * @param {string} containerId - Container element ID
     */
    static createXPByProjectChart(transactions, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !transactions || transactions.length === 0) {
            container.innerHTML = '<p>No project XP data available</p>';
            return;
        }

        // Group XP by project path
        const projectXP = {};
        transactions.forEach(transaction => {
            if (transaction.path && transaction.amount > 0) {
                // Extract project name from path
                const pathParts = transaction.path.split('/');
                const projectName = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2] || 'Unknown';

                if (!projectXP[projectName]) {
                    projectXP[projectName] = 0;
                }
                projectXP[projectName] += transaction.amount;
            }
        });

        // Convert to array and sort by XP
        const projectData = Object.entries(projectXP)
            .map(([name, xp]) => ({ name, xp }))
            .sort((a, b) => b.xp - a.xp)
            .slice(0, 10); // Top 10 projects

        if (projectData.length === 0) {
            container.innerHTML = '<p>No project data to display</p>';
            return;
        }

        const width = 500;
        const height = 350;
        const margin = { top: 20, right: 20, bottom: 80, left: 60 };
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

        const maxXP = Math.max(...projectData.map(p => p.xp));
        const barWidth = chartWidth / projectData.length - 10;

        projectData.forEach((project, index) => {
            const x = index * (barWidth + 10);
            const barHeight = (project.xp / maxXP) * chartHeight;
            const y = chartHeight - barHeight;

            // Bar
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', y);
            rect.setAttribute('width', barWidth);
            rect.setAttribute('height', barHeight);
            rect.setAttribute('fill', CONFIG.CHART_COLORS.primary);
            rect.setAttribute('stroke', 'white');
            rect.setAttribute('stroke-width', '1');

            // Tooltip
            const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            title.textContent = `${project.name}: ${Utils.formatXP(project.xp)}`;
            rect.appendChild(title);

            chartGroup.appendChild(rect);

            // Project name (rotated)
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', x + barWidth / 2);
            label.setAttribute('y', chartHeight + 15);
            label.setAttribute('text-anchor', 'start');
            label.setAttribute('fill', '#333');
            label.setAttribute('font-size', '10');
            label.setAttribute('transform', `rotate(45, ${x + barWidth / 2}, ${chartHeight + 15})`);
            label.textContent = project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name;
            chartGroup.appendChild(label);

            // XP value on top of bar
            const value = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            value.setAttribute('x', x + barWidth / 2);
            value.setAttribute('y', y - 5);
            value.setAttribute('text-anchor', 'middle');
            value.setAttribute('fill', '#333');
            value.setAttribute('font-size', '10');
            value.textContent = Utils.formatXP(project.xp);
            chartGroup.appendChild(value);
        });

        // Add axes
        this.addAxes(chartGroup, chartWidth, chartHeight, null, null, maxXP);

        // Y-axis label
        const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yLabel.setAttribute('x', -40);
        yLabel.setAttribute('y', chartHeight / 2);
        yLabel.setAttribute('text-anchor', 'middle');
        yLabel.setAttribute('font-size', '12');
        yLabel.setAttribute('fill', '#666');
        yLabel.setAttribute('transform', `rotate(-90, -40, ${chartHeight / 2})`);
        yLabel.textContent = 'XP Earned';
        chartGroup.appendChild(yLabel);

        svg.appendChild(chartGroup);
        container.innerHTML = '';
        container.appendChild(svg);
    }

    /**
     * Create Piscine (JS/Go) statistics chart
     * @param {Array} progress - Progress data
     * @param {string} containerId - Container element ID
     */
    static createPiscineStatsChart(progress, containerId) {
        const container = document.getElementById(containerId);
        if (!container || !progress || progress.length === 0) {
            container.innerHTML = '<p>No piscine data available</p>';
            return;
        }

        // Filter piscine data (JS and Go)
        const piscineData = progress.filter(p =>
            p.path && (
                p.path.includes('piscine-js') ||
                p.path.includes('piscine-go') ||
                p.path.includes('/js/') ||
                p.path.includes('/go/')
            )
        );

        if (piscineData.length === 0) {
            container.innerHTML = '<p>No piscine data found</p>';
            return;
        }

        // Group by piscine type and calculate stats
        const piscineStats = {
            'JavaScript': { passed: 0, failed: 0, total: 0 },
            'Go': { passed: 0, failed: 0, total: 0 }
        };

        piscineData.forEach(item => {
            const isJS = item.path.includes('js') || item.path.includes('javascript');
            const type = isJS ? 'JavaScript' : 'Go';

            piscineStats[type].total++;
            if (item.grade >= 1) {
                piscineStats[type].passed++;
            } else {
                piscineStats[type].failed++;
            }
        });

        const width = 450;
        const height = 300;
        const margin = { top: 20, right: 20, bottom: 60, left: 80 };
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

        const languages = Object.keys(piscineStats).filter(lang => piscineStats[lang].total > 0);
        const barGroupWidth = chartWidth / languages.length;
        const barWidth = barGroupWidth / 3 - 5;

        languages.forEach((lang, langIndex) => {
            const stats = piscineStats[lang];
            const groupX = langIndex * barGroupWidth;

            // Passed bar
            const passedHeight = stats.total > 0 ? (stats.passed / stats.total) * chartHeight * 0.8 : 0;
            const passedRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            passedRect.setAttribute('x', groupX);
            passedRect.setAttribute('y', chartHeight - passedHeight);
            passedRect.setAttribute('width', barWidth);
            passedRect.setAttribute('height', passedHeight);
            passedRect.setAttribute('fill', CONFIG.CHART_COLORS.success);
            passedRect.setAttribute('stroke', 'white');
            passedRect.setAttribute('stroke-width', '1');

            const passedTitle = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            passedTitle.textContent = `${lang} Passed: ${stats.passed}/${stats.total} (${Math.round((stats.passed/stats.total)*100)}%)`;
            passedRect.appendChild(passedTitle);
            chartGroup.appendChild(passedRect);

            // Failed bar
            const failedHeight = stats.total > 0 ? (stats.failed / stats.total) * chartHeight * 0.8 : 0;
            const failedRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            failedRect.setAttribute('x', groupX + barWidth + 5);
            failedRect.setAttribute('y', chartHeight - failedHeight);
            failedRect.setAttribute('width', barWidth);
            failedRect.setAttribute('height', failedHeight);
            failedRect.setAttribute('fill', CONFIG.CHART_COLORS.danger);
            failedRect.setAttribute('stroke', 'white');
            failedRect.setAttribute('stroke-width', '1');

            const failedTitle = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            failedTitle.textContent = `${lang} Failed: ${stats.failed}/${stats.total} (${Math.round((stats.failed/stats.total)*100)}%)`;
            failedRect.appendChild(failedTitle);
            chartGroup.appendChild(failedRect);

            // Total bar (outline)
            const totalRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            totalRect.setAttribute('x', groupX + (barWidth + 5) * 2);
            totalRect.setAttribute('y', chartHeight - (chartHeight * 0.8));
            totalRect.setAttribute('width', barWidth);
            totalRect.setAttribute('height', chartHeight * 0.8);
            totalRect.setAttribute('fill', 'none');
            totalRect.setAttribute('stroke', CONFIG.CHART_COLORS.dark);
            totalRect.setAttribute('stroke-width', '2');
            totalRect.setAttribute('stroke-dasharray', '5,5');

            const totalTitle = document.createElementNS('http://www.w3.org/2000/svg', 'title');
            totalTitle.textContent = `${lang} Total: ${stats.total}`;
            totalRect.appendChild(totalTitle);
            chartGroup.appendChild(totalRect);

            // Language label
            const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            label.setAttribute('x', groupX + barGroupWidth / 2);
            label.setAttribute('y', chartHeight + 20);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('fill', '#333');
            label.setAttribute('font-size', '14');
            label.setAttribute('font-weight', 'bold');
            label.textContent = lang;
            chartGroup.appendChild(label);

            // Stats text
            const statsText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            statsText.setAttribute('x', groupX + barGroupWidth / 2);
            statsText.setAttribute('y', chartHeight + 40);
            statsText.setAttribute('text-anchor', 'middle');
            statsText.setAttribute('fill', '#666');
            statsText.setAttribute('font-size', '10');
            statsText.textContent = `${stats.passed}P / ${stats.failed}F / ${stats.total}T`;
            chartGroup.appendChild(statsText);
        });

        // Legend
        const legendY = 20;

        // Passed legend
        const passedLegendRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        passedLegendRect.setAttribute('x', chartWidth - 120);
        passedLegendRect.setAttribute('y', legendY);
        passedLegendRect.setAttribute('width', 15);
        passedLegendRect.setAttribute('height', 15);
        passedLegendRect.setAttribute('fill', CONFIG.CHART_COLORS.success);
        chartGroup.appendChild(passedLegendRect);

        const passedLegendText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        passedLegendText.setAttribute('x', chartWidth - 100);
        passedLegendText.setAttribute('y', legendY + 12);
        passedLegendText.setAttribute('fill', '#333');
        passedLegendText.setAttribute('font-size', '12');
        passedLegendText.textContent = 'Passed';
        chartGroup.appendChild(passedLegendText);

        // Failed legend
        const failedLegendRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        failedLegendRect.setAttribute('x', chartWidth - 120);
        failedLegendRect.setAttribute('y', legendY + 20);
        failedLegendRect.setAttribute('width', 15);
        failedLegendRect.setAttribute('height', 15);
        failedLegendRect.setAttribute('fill', CONFIG.CHART_COLORS.danger);
        chartGroup.appendChild(failedLegendRect);

        const failedLegendText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        failedLegendText.setAttribute('x', chartWidth - 100);
        failedLegendText.setAttribute('y', legendY + 32);
        failedLegendText.setAttribute('fill', '#333');
        failedLegendText.setAttribute('font-size', '12');
        failedLegendText.textContent = 'Failed';
        chartGroup.appendChild(failedLegendText);

        // Add basic axes
        const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        xAxis.setAttribute('x1', 0);
        xAxis.setAttribute('y1', chartHeight);
        xAxis.setAttribute('x2', chartWidth);
        xAxis.setAttribute('y2', chartHeight);
        xAxis.setAttribute('stroke', '#333');
        chartGroup.appendChild(xAxis);

        const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        yAxis.setAttribute('x1', 0);
        yAxis.setAttribute('y1', 0);
        yAxis.setAttribute('x2', 0);
        yAxis.setAttribute('y2', chartHeight);
        yAxis.setAttribute('stroke', '#333');
        chartGroup.appendChild(yAxis);

        // Y-axis label
        const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yLabel.setAttribute('x', -50);
        yLabel.setAttribute('y', chartHeight / 2);
        yLabel.setAttribute('text-anchor', 'middle');
        yLabel.setAttribute('font-size', '12');
        yLabel.setAttribute('fill', '#666');
        yLabel.setAttribute('transform', `rotate(-90, -50, ${chartHeight / 2})`);
        yLabel.textContent = 'Success Rate';
        chartGroup.appendChild(yLabel);

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
    static addAxes(chartGroup, chartWidth, chartHeight) {
        // X-axis
        const xAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        xAxis.setAttribute('x1', 0);
        xAxis.setAttribute('y1', chartHeight);
        xAxis.setAttribute('x2', chartWidth);
        xAxis.setAttribute('y2', chartHeight);
        xAxis.setAttribute('stroke', CONFIG.CHART_COLORS.border);
        xAxis.setAttribute('stroke-width', '1');
        chartGroup.appendChild(xAxis);

        // Y-axis
        const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        yAxis.setAttribute('x1', 0);
        yAxis.setAttribute('y1', 0);
        yAxis.setAttribute('x2', 0);
        yAxis.setAttribute('y2', chartHeight);
        yAxis.setAttribute('stroke', CONFIG.CHART_COLORS.border);
        yAxis.setAttribute('stroke-width', '1');
        chartGroup.appendChild(yAxis);

        // Axis labels
        const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        xLabel.setAttribute('x', chartWidth / 2);
        xLabel.setAttribute('y', chartHeight + 30);
        xLabel.setAttribute('text-anchor', 'middle');
        xLabel.setAttribute('font-size', '12');
        xLabel.setAttribute('fill', CONFIG.CHART_COLORS.textSecondary);
        xLabel.textContent = 'Time';
        chartGroup.appendChild(xLabel);

        const yLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        yLabel.setAttribute('x', -30);
        yLabel.setAttribute('y', chartHeight / 2);
        yLabel.setAttribute('text-anchor', 'middle');
        yLabel.setAttribute('font-size', '12');
        yLabel.setAttribute('fill', CONFIG.CHART_COLORS.textSecondary);
        yLabel.setAttribute('transform', `rotate(-90, -30, ${chartHeight / 2})`);
        yLabel.textContent = 'XP';
        chartGroup.appendChild(yLabel);
    }
}

// Export to global scope
window.Charts = Charts;
