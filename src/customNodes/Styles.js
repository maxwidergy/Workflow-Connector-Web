import { styled } from '@mui/system';

export const Node = styled('div')(({ theme, selected, width = 350 }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  flexDirection: 'column',
  width,
  justifyContent: 'space-between',
  alignItems: 'stretch',
  cursor: 'pointer',
  boxShadow: selected
    ? `0 0 0 2px ${theme.palette.primary.main}`
    : theme.palette.mode === 'dark'
    ? '0px 4px 6px rgba(255, 255, 255, 0.15)'
    : '0px 4px 6px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    boxShadow: selected
      ? `0 0 0 2px ${theme.palette.primary.main}`
      : theme.palette.mode === 'dark'
      ? '0px 6px 8px rgba(255, 255, 255, 0.2)'
      : '0px 6px 8px rgba(0, 0, 0, 0.15)',
  },
}));

export const NodeHeader = styled('div')(({ theme, backgroundColor, color }) => ({
  backgroundColor: backgroundColor || theme.palette.primary.main,
  borderRadius: theme.shape.borderRadius,
  color: color || theme.palette.primary.contrastText,
  fontWeight: theme.typography.fontWeightBold,
  marginBottom: theme.spacing(1),
  padding: theme.spacing(1),
  textAlign: 'center',
  cursor: 'grab',
  width: '100%',
}));

export const NodeContent = styled('div')({
  cursor: 'pointer',
});

export const NodeHandle = styled('div')(({ theme }) => ({
  width: 8,
  height: 8,
  borderRadius: '50%',
  border: `2px solid ${theme.palette.common.white}`,
  boxShadow: theme.shadows[1],
  backgroundColor: theme.palette.grey[500],
  transition: theme.transitions.create('background-color', {
    duration: theme.transitions.duration.short,
    easing: theme.transitions.easing.easeInOut,
  }),
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
  },
}));

export const HandleTarget = styled('div')({
  marginLeft: -4,
});

export const HandleSource = styled('div')({
  marginRight: -4,
});

export const HandleSourceTop = styled('div')({
  top: 20,
});

export const HandleSourceBottom = styled('div')({
  bottom: 20,
});
