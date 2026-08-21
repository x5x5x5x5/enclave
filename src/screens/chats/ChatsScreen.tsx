import { ListColumn, MainColumn } from '../../components/shell/Columns'
import { EmptyState } from '../../components/primitives/EmptyState'

export function ChatsScreen() {
  return (
    <>
      <ListColumn>
        <div className="p-4 text-13 text-low">Chat list arrives in P1.</div>
      </ListColumn>
      <MainColumn hideOnMobile>
        <div className="flex flex-1 items-center justify-center">
          <EmptyState title="Pick a conversation" body="Or press Cmd K to jump anywhere." />
        </div>
      </MainColumn>
    </>
  )
}
