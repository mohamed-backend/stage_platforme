from django.db import models
from projects.models import Project

# Risk calculation constants
RISK_LEVEL_SCORES = {'LOW': 20, 'MEDIUM': 50, 'HIGH': 80}
DEFAULT_RISK_SCORE = 50

# Target amount thresholds
TARGET_AMOUNT_THRESHOLDS = [
    (1000000, 20),
    (500000, 15),
    (100000, 10),
    (50000, 5),
]

# Duration thresholds (months)
DURATION_THRESHOLDS = [
    (60, 15),
    (36, 10),
    (12, 5),
]

# Return thresholds
RETURN_THRESHOLDS = [
    (15, 15),
    (10, 10),
    (5, 5),
]

# Category risk mapping
CATEGORY_RISK = {
    'tech': 10,
    'startup': 15,
    'crypto': 20,
    'real_estate': 5,
    'energy': 5,
    'agriculture': 5,
}

# Owner experience thresholds
OWNER_EXPERIENCE_THRESHOLDS = [
    (0, 10),
    (3, 5),
]

# Score level thresholds
SCORE_LEVEL_THRESHOLDS = [
    (35, 'LOW'),
    (65, 'MEDIUM'),
    (100, 'HIGH'),
]

# Explanation thresholds
EXPLANATION_THRESHOLDS = {
    'target_amount_factor': 10,
    'duration_factor': 10,
    'return_factor': 10,
    'category_factor': 10,
    'owner_factor': 5,
}


class RiskAssessment(models.Model):
    """
    Risk assessment model for projects.
    Automatically calculated based on project characteristics.
    """

    project = models.OneToOneField(
        'projects.Project', on_delete=models.CASCADE, related_name='risk_assessment'
    )

    score = models.FloatField(null=True, blank=True, help_text='Risk score (0-100)')

    level = models.CharField(
        max_length=20,
        choices=[
            ('LOW', 'Faible'),
            ('MEDIUM', 'Moyen'),
            ('HIGH', 'Élevé'),
        ],
        blank=True,
    )

    factors = models.JSONField(default=dict, blank=True, help_text='Risk factors and their weights')

    assessed_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Évaluation de risque'
        verbose_name_plural = 'Évaluations de risque'

    def __str__(self):
        return f'Risk Assessment for {self.project.title}'

    def calculate_risk(self):
        """Calculate risk score based on project attributes"""
        project = self.project

        base_score = self._calculate_base_score(project)
        target_amount_factor = self._calculate_target_amount_factor(project)
        duration_factor = self._calculate_duration_factor(project)
        return_factor = self._calculate_return_factor(project)
        category_factor = self._calculate_category_factor(project)
        owner_factor = self._calculate_owner_factor(project)

        total_score = (
            base_score
            + target_amount_factor
            + duration_factor
            + return_factor
            + category_factor
            + owner_factor
        )
        total_score = min(max(total_score, 0), 100)

        level = self._determine_level(total_score)

        factors = {
            'base_score': base_score,
            'target_amount_factor': target_amount_factor,
            'duration_factor': duration_factor,
            'return_factor': return_factor,
            'category_factor': category_factor,
            'owner_factor': owner_factor,
            'probability': min(100, total_score),
            'impact': min(100, base_score + target_amount_factor),
            'explanation': self._generate_explanation(
                total_score,
                level,
                base_score,
                target_amount_factor,
                duration_factor,
                return_factor,
                category_factor,
                owner_factor,
            ),
            'model_version': 'v1.0',
        }

        return total_score, level, factors

    def _calculate_base_score(self, project):
        """Calculate base score from risk_level"""
        return RISK_LEVEL_SCORES.get(project.risk_level, DEFAULT_RISK_SCORE)

    def _calculate_target_amount_factor(self, project):
        """Calculate risk factor based on target amount"""
        if not project.target_amount:
            return 0

        amount = float(project.target_amount)
        for threshold, factor in TARGET_AMOUNT_THRESHOLDS:
            if amount > threshold:
                return factor
        return 0

    def _calculate_duration_factor(self, project):
        """Calculate risk factor based on duration"""
        if not project.duration_months:
            return 0

        for threshold, factor in DURATION_THRESHOLDS:
            if project.duration_months > threshold:
                return factor
        return 0

    def _calculate_return_factor(self, project):
        """Calculate risk factor based on expected return"""
        if not project.expected_return:
            return 0

        ret = float(project.expected_return)
        for threshold, factor in RETURN_THRESHOLDS:
            if ret > threshold:
                return factor
        return 0

    def _calculate_category_factor(self, project):
        """Calculate risk factor based on category"""
        if not project.category:
            return 0
        return CATEGORY_RISK.get(project.category.lower(), 0)

    def _calculate_owner_factor(self, project):
        """Calculate risk factor based on owner experience"""
        owner_projects = Project.objects.filter(owner=project.owner).count()
        for threshold, factor in OWNER_EXPERIENCE_THRESHOLDS:
            if owner_projects <= threshold:
                return factor
        return 0

    def _determine_level(self, total_score):
        """Determine risk level from total score"""
        for threshold, level in SCORE_LEVEL_THRESHOLDS:
            if total_score <= threshold:
                return level
        return 'HIGH'

    def _generate_explanation(
        self,
        total_score,
        level,
        base_score,
        target_amount_factor,
        duration_factor,
        return_factor,
        category_factor,
        owner_factor,
    ):
        parts = []

        level_desc = {
            'LOW': 'Ce projet présente un niveau de risque faible.',
            'MEDIUM': 'Ce projet présente un niveau de risque modéré.',
            'HIGH': 'Ce projet présente un niveau de risque élevé.',
        }
        parts.append(level_desc.get(level, ''))

        factors_detail = []
        if target_amount_factor > EXPLANATION_THRESHOLDS['target_amount_factor']:
            factors_detail.append('un montant cible élevé')
        if duration_factor > EXPLANATION_THRESHOLDS['duration_factor']:
            factors_detail.append("une durée d'investissement longue")
        if return_factor > EXPLANATION_THRESHOLDS['return_factor']:
            factors_detail.append('un rendement attendu élevé')
        if category_factor > EXPLANATION_THRESHOLDS['category_factor']:
            factors_detail.append("un secteur d'activité à risque")
        if owner_factor > EXPLANATION_THRESHOLDS['owner_factor']:
            factors_detail.append('un porteur de projet peu expérimenté')

        if factors_detail:
            parts.append(f'Les principaux facteurs de risque sont : {", ".join(factors_detail)}.')

        parts.append(f'Score global : {total_score}/100.')

        return ' '.join(parts)
