import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import MailIcon from '@mui/icons-material/Mail';
import MenuIcon from '@mui/icons-material/Menu';
import InfoIcon from '@mui/icons-material/InfoRounded';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import {useState} from "react";
import {useMediaQuery} from "@mui/material";

const drawerWidth = 300;

export class Page {
  constructor(public key: string, public title: string, public element: JSX.Element, public handleClickOpen?: () => void) {
  }
}

interface Props {
  pageList: Page[];
}

export default function ResponsiveDrawer(props: Props) {
  const { pageList } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const [selectedPage, setSelectedPage] = useState<number>(0);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleItemClick = (page: number) => {
    setSelectedPage(page)
    setMobileOpen(false)
  }

  const drawer = (
    <div>
      <List>
        {pageList.map((page: Page, index) => (
          <ListItem
            key={page.key}
            disablePadding
            secondaryAction={
              <IconButton
                edge="end"
                onClick={pageList[index].handleClickOpen}
                sx={{display: pageList[index].handleClickOpen && selectedPage === index ? 'inline' : 'none', alignItems: 'center'}}
              >
                <InfoIcon />
              </IconButton>
            }
          >
            <ListItemButton
              onClick={() => handleItemClick(index)}
              selected={selectedPage === index}
            >
              <ListItemIcon>
                {index % 2 === 0 ? <InboxIcon /> : <MailIcon />}
              </ListItemIcon>
              <ListItemText primary={page.title} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  const isPageWide = useMediaQuery('(min-width:900px)')

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
      }}
    >
      <Box
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box
          sx={{
            height: '56px',
            display: { md: 'none' },
            flexShrink: 0,
          }}
        >
          <AppBar
            color={'default'}
          >
            <Toolbar
              variant={'dense'}
            >
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div">
                {selectedPage ? pageList[selectedPage].title : 'Responsive drawer'}
              </Typography>
              <div style={{flexGrow: 1}} />
              <IconButton
                size="large"
                onClick={pageList[selectedPage].handleClickOpen}
                sx={{display: pageList[selectedPage].handleClickOpen ? 'inline' : 'none', alignItems: 'center'}}
                color="inherit"
              >
                <InfoIcon />
              </IconButton>
            </Toolbar>
          </AppBar>

        </Box>
        <Box
          style={{
            width: '100%',
            flexGrow: 1,
            overflow: 'auto',
          }}
        >
          {pageList[selectedPage].element}
        </Box>
      </Box>
    </Box>
  );
}
