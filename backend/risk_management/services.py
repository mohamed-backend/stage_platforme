from .models import RiskAssessment
from django.utils import timezone
from projects.models import Project


def calculate_risk_for_project(project: Project) -> RiskAssessment:
    """
    Calculate and save risk assessment for a project.
    """
    assessment, _created = RiskAssessment.objects.get_or_create(
        project=project, defaults={'assessed_at': timezone.now()}
    )

    score, level, factors = assessment.calculate_risk()

    assessment.score = score
    assessment.level = level
    assessment.factors = factors
    assessment.assessed_at = timezone.now()
    assessment.save()

    return assessment


def calculate_risk_for_all_published():
    """
    Calculate risk for all published projects without assessment.
    """
    projects = Project.objects.filter(status='PUBLISHED')
    results = []

    for project in projects:
        assessment = calculate_risk_for_project(project)
        results.append(
            {
                'project_id': project.id,
                'project_title': project.title,
                'score': assessment.score,
                'level': assessment.level,
            }
        )

    return results


def calculate_risk_for_pending():
    """
    Calculate risk for pending projects (for insurer review).
    """
    projects = Project.objects.filter(status='PENDING')
    results = []

    for project in projects:
        assessment = calculate_risk_for_project(project)
        results.append(
            {
                'project_id': project.id,
                'project_title': project.title,
                'score': assessment.score,
                'level': assessment.level,
            }
        )

    return results
