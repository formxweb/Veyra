import { openPanel } from '../stores/ui';
import { Icon } from './shared';

export default function MenuButton() {
  return (
    <button type="button" class="icon-btn" onClick={() => openPanel('menu')} aria-label="Menüyü aç" aria-haspopup="dialog">
      <Icon name="menu" />
    </button>
  );
}
