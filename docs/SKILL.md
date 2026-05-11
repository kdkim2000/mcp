# SKILL.md — 워크플로우 정의

이 문서는 토큰 추적과 관련된 반복 워크플로우를 정의합니다.

---

## Skill 1: `track-tokens` (대화 종료 트리거)

**목적**: 모든 대화가 끝날 때 자동으로 토큰 사용량을 기록

**트리거**: 사용자의 마지막 요청에 대한 응답 완료 직후

**실행 순서**:
1. 현재 대화의 토큰 수 추정
2. `log_usage` tool 호출
3. 기록 완료 확인 (id 반환)

**Claude Code hook으로 자동화하려면**:
```json
// .claude/settings.json에 추가
{
  "hooks": {
    "Stop": [
      {
        "matcher": "",
        "hooks": [{
          "type": "command",
          "command": "echo 'Session ended - remember to log_usage'"
        }]
      }
    ]
  }
}
```

---

## Skill 2: `daily-report` (수동 워크플로우)

**목적**: 하루 사용량 확인 및 Google Sheets 제출

**트리거**: 사용자가 "오늘 사용량 제출해줘" 또는 "일별 리포트 제출" 요청 시

**실행 순서**:
1. `get_my_stats` 호출 (오늘 날짜 필터)
2. 통계 테이블을 사용자에게 보여줌
3. `submit_daily_report` 호출
4. 제출 결과 보고

**예시 대화**:
```
사용자: 오늘 사용량 정리해서 제출해줘

AI: [get_my_stats 호출]
    오늘(2026-05-12) 사용량:
    | 모델 | 입력 | 출력 | 합계 |
    | claude-sonnet-4-6 | 15,230 | 4,820 | 20,050 |

    [submit_daily_report 호출]
    제출 성공: 1행 제출 완료
```

---

## 주간 점검 (선택)

매주 월요일에 지난 주 사용량을 확인하려면:

```
사용자: 지난주 사용량 보여줘

AI: [get_my_stats 호출, limit: 14]
    → 최근 14일치 날짜별 통계 반환
```

---

## OS 스케줄러로 자동 제출 (고급)

Windows Task Scheduler를 사용해 매일 오후 6시에 자동 제출:

```powershell
# 스케줄러 등록 (PowerShell 관리자 권한)
$action = New-ScheduledTaskAction `
  -Execute "node" `
  -Argument "E:\apps\mcp\dist\index.js" `
  -WorkingDirectory "E:\apps\mcp"

$trigger = New-ScheduledTaskTrigger -Daily -At "18:00"

Register-ScheduledTask -TaskName "MCPDailyReport" `
  -Action $action -Trigger $trigger -RunLevel Highest
```

> 자동화 시에는 `submit_daily_report`를 직접 호출하는 별도 스크립트를 작성하는 것이 더 적합합니다.
