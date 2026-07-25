"""End-to-end deterministic test for the mock interview service."""

from __future__ import annotations

from backend.schemas.interview import (
    InterviewAnswerRequest,
    InterviewDifficulty,
    InterviewEndRequest,
    InterviewStartRequest,
)
from backend.services.interview_service import InterviewService


def main() -> int:
    """Run a complete three-question mock interview."""

    service = InterviewService()
    started = service.start_interview(
        InterviewStartRequest(
            learning_goal="Become a Data Scientist",
            interview_role="Junior Data Scientist",
            difficulty=InterviewDifficulty.INTERMEDIATE,
            number_of_questions=3,
        )
    )

    print(f"Interview ID: {started.interview_id}")
    question = started.current_question
    print(f"Question {question.question_number}: {question.question}")

    while True:
        answered = service.submit_answer(
            InterviewAnswerRequest(
                interview_id=started.interview_id,
                answer=f"Sample answer for question {question.question_number}.",
            )
        )
        print(f"Feedback: {answered.feedback}")
        if answered.is_interview_complete:
            break
        if answered.next_question is None:
            print("Interview failed: next question is missing.")
            return 1
        question = answered.next_question
        print(f"Question {question.question_number}: {question.question}")

    ended = service.end_interview(
        InterviewEndRequest(interview_id=started.interview_id)
    )
    summary = ended.summary
    print("Final Summary:")
    print(f"- Technical Score: {summary.technical_score}")
    print(f"- Communication Score: {summary.communication_score}")
    print(f"- Confidence Score: {summary.confidence_score}")
    print(f"- Questions Answered: {summary.questions_answered}")
    print(f"- Overall Feedback: {summary.overall_feedback}")

    passed = (
        summary.questions_answered == 3
        and summary.technical_score == 80
        and summary.communication_score == 75
        and summary.confidence_score == 82
    )
    print(f"Interview service test: {'PASS' if passed else 'FAIL'}")
    return 0 if passed else 1


if __name__ == "__main__":
    raise SystemExit(main())
